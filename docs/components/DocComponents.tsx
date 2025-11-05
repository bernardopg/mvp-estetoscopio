import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { ReactNode } from "react";

type CalloutType = "info" | "warning" | "success" | "error";

interface CalloutProps {
  type?: CalloutType;
  children: ReactNode;
  title?: string;
}

export function Callout({ type = "info", children, title }: CalloutProps) {
  const config = {
    info: {
      icon: Info,
      className:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-900 dark:text-blue-100",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    warning: {
      icon: AlertCircle,
      className:
        "bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-900 dark:text-amber-100",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    success: {
      icon: CheckCircle,
      className:
        "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100",
      iconColor: "text-green-600 dark:text-green-400",
    },
    error: {
      icon: XCircle,
      className:
        "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100",
      iconColor: "text-red-600 dark:text-red-400",
    },
  };

  const { icon: Icon, className, iconColor } = config[type];

  return (
    <div className={`border-l-4 p-4 my-4 rounded-r-lg ${className}`}>
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
        <div className="flex-1">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface CodeBlockProps {
  children: ReactNode;
  title?: string;
  language?: string;
}

export function CodeBlock({ children, title, language }: CodeBlockProps) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700">
      {title && (
        <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-mono flex items-center justify-between">
          <span>{title}</span>
          {language && (
            <span className="text-gray-400 text-xs uppercase">{language}</span>
          )}
        </div>
      )}
      <div className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
        <pre className="font-mono text-sm">{children}</pre>
      </div>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  children: ReactNode;
}

export function Step({ number, title, children }: StepProps) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="text-gray-700 dark:text-gray-300">{children}</div>
      </div>
    </div>
  );
}

interface TabsProps {
  children: ReactNode;
}

export function Tabs({ children }: TabsProps) {
  return <div className="my-6">{children}</div>;
}

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 my-4 bg-white dark:bg-gray-800 ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      <div className="text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  );
}

interface FeatureGridProps {
  children: ReactNode;
}

export function FeatureGrid({ children }: FeatureGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
      {children}
    </div>
  );
}
