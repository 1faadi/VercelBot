import React from 'react';

interface MessageParserProps {
  content: string;
  role: 'user' | 'assistant';
}

export const MessageParser: React.FC<MessageParserProps> = ({ content, role }) => {
  if (role === 'user') {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  // Parse assistant messages with enhanced formatting
  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentTable: string[] = [];
    let currentCodeBlock: string[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';

    const flushTable = () => {
      if (currentTable.length > 0) {
        elements.push(renderTable(currentTable, elements.length));
        currentTable = [];
      }
    };

    const flushCodeBlock = () => {
      if (currentCodeBlock.length > 0) {
        elements.push(renderCodeBlock(currentCodeBlock, codeLanguage, elements.length));
        currentCodeBlock = [];
        inCodeBlock = false;
        codeLanguage = '';
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          flushTable(); // Flush any pending table
          inCodeBlock = true;
          codeLanguage = line.substring(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        currentCodeBlock.push(line);
        continue;
      }

      // Handle tables (lines with | separators)
      if (line.includes('|') && line.trim().length > 0) {
        currentTable.push(line);
        continue;
      } else {
        flushTable(); // Flush table if we encounter a non-table line
      }

      // Handle headers
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        elements.push(
          <h3 key={elements.length} className="text-lg font-bold mt-4 mb-2 text-gray-800">
            {line.slice(2, -2)}
          </h3>
        );
        continue;
      }

      // Handle subheaders
      if (line.startsWith('*') && line.endsWith('*') && line.length > 2 && !line.startsWith('**')) {
        elements.push(
          <h4 key={elements.length} className="text-md font-semibold mt-3 mb-2 text-gray-700">
            {line.slice(1, -1)}
          </h4>
        );
        continue;
      }

      // Handle bullet points
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        const bulletText = line.trim().substring(1).trim();
        elements.push(
          <div key={elements.length} className="flex items-start mb-1">
            <span className="text-blue-600 mr-2 mt-1">•</span>
            <span>{parseInlineFormatting(bulletText)}</span>
          </div>
        );
        continue;
      }

      // Handle numbered lists
      if (/^\d+\./.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s*(.*)/);
        if (match) {
          const [, number, text] = match;
          elements.push(
            <div key={elements.length} className="flex items-start mb-1">
              <span className="text-blue-600 mr-2 mt-1 font-medium">{number}.</span>
              <span>{parseInlineFormatting(text)}</span>
            </div>
          );
          continue;
        }
      }

      // Handle empty lines
      if (line.trim() === '') {
        if (elements.length > 0) {
          elements.push(<br key={elements.length} />);
        }
        continue;
      }

      // Handle regular paragraphs
      elements.push(
        <p key={elements.length} className="mb-2 leading-relaxed">
          {parseInlineFormatting(line)}
        </p>
      );
    }

    // Flush any remaining content
    flushTable();
    flushCodeBlock();

    return elements;
  };

  const parseInlineFormatting = (text: string) => {
    // Handle bold text **text**
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text *text*
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle inline code `code`
    formattedText = formattedText.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Handle bracketed placeholders [text]
    formattedText = formattedText.replace(/\[(.*?)\]/g, '<span class="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded text-sm font-medium">$1</span>');
    
    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  const renderTable = (tableLines: string[], key: number) => {
    if (tableLines.length === 0) return null;

    const rows = tableLines.map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0)
    );

    // Filter out separator lines (lines with only dashes)
    const dataRows = rows.filter(row => 
      !row.every(cell => /^-+$/.test(cell.replace(/\s/g, '')))
    );

    if (dataRows.length === 0) return null;

    const hasHeader = dataRows.length > 1;
    const headerRow = hasHeader ? dataRows[0] : null;
    const bodyRows = hasHeader ? dataRows.slice(1) : dataRows;

    return (
      <div key={key} className="my-4 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          {headerRow && (
            <thead>
              <tr className="bg-gray-50">
                {headerRow.map((cell, cellIndex) => (
                  <th
                    key={cellIndex}
                    className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700"
                  >
                    {parseInlineFormatting(cell)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {bodyRows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border border-gray-300 px-3 py-2 text-gray-700"
                  >
                    {parseInlineFormatting(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCodeBlock = (codeLines: string[], language: string, key: number) => {
    const code = codeLines.join('\n');
    
    return (
      <div key={key} className="my-4">
        {language && (
          <div className="bg-gray-700 text-white px-3 py-1 text-xs font-mono rounded-t-md">
            {language}
          </div>
        )}
        <pre className={`bg-gray-300 p-4 overflow-x-auto text-sm font-mono ${language ? 'rounded-b-md' : 'rounded-md'}`}>
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  return <div className="message-content">{parseContent(content)}</div>;
};