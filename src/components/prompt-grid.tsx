'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CalculatorIcon,
  FileTextIcon,
  BarChart3Icon,
  LineChartIcon,
} from "lucide-react";

interface Prompt {
  icon: React.ReactNode;
  text: string;
}

interface PromptGridProps {
  onPromptClick: (text: string) => void;
}

const prompts: Prompt[] = [
  {
    icon: <FileTextIcon className="w-5 h-5" />,
    text: "Summarize this article",
  },
  {
    icon: <BarChart3Icon className="w-5 h-5" />,
    text: "Generate a report",
  },
  {
    icon: <LineChartIcon className="w-5 h-5" />,
    text: "Analyze this chart",
  },
  {
    icon: <CalculatorIcon className="w-5 h-5" />,
    text: "Fix this code",
  },
];

export default function PromptGrid({ onPromptClick }: PromptGridProps) {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      <h3 className="text-center text-gray-500 text-sm mb-4">
        Try one of the prompts
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex items-center space-x-2 justify-center py-6 text-sm"
            onClick={() => onPromptClick(prompt.text)}
          >
            {prompt.icon}
            <span>{prompt.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
