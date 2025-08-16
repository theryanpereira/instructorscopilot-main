import { useState } from "react";
import { GitCompare, FileText, Download, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DiffLine {
  lineNumber: number;
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  content: string;
  originalLineNumber?: number;
}

interface ContentVersion {
  id: string;
  title: string;
  timestamp: string;
  author: string;
  content: string;
  changes?: number;
}

export function DiffViewer() {
  const [selectedVersions, setSelectedVersions] = useState({
    original: '',
    modified: ''
  });
  
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);
  const [sideBySide, setSideBySide] = useState(true);

  // Mock data for content versions
  const contentVersions: ContentVersion[] = [
    {
      id: '1',
      title: 'Introduction to React - Original',
      timestamp: '2024-01-15 10:30',
      author: 'AI Assistant',
      content: `# Introduction to React

React is a JavaScript library for building user interfaces. It was created by Facebook and is now maintained by Meta and the community.

## Key Features
- Component-based architecture
- Virtual DOM for better performance
- Declarative programming style
- Strong ecosystem and community

## Getting Started
To start with React, you need to understand:
1. JSX syntax
2. Components and props
3. State management
4. Event handling

React makes it easy to create interactive UIs.`,
      changes: 0
    },
    {
      id: '2',
      title: 'Introduction to React - Student Revision',
      timestamp: '2024-01-15 14:45',
      author: 'Student',
      content: `# Introduction to React

React is a powerful JavaScript library for building user interfaces. It was created by Facebook in 2013 and is now maintained by Meta and the open-source community.

## Key Features
- Component-based architecture for reusable code
- Virtual DOM for optimal performance
- Declarative programming style
- Strong ecosystem and active community
- Excellent developer tools

## Getting Started
To start with React, you need to understand these core concepts:
1. JSX syntax and how it works
2. Components, props, and composition
3. State management and hooks
4. Event handling and user interactions
5. Component lifecycle

React makes it easy to create interactive and dynamic UIs with minimal effort.`,
      changes: 8
    },
    {
      id: '3',
      title: 'Introduction to React - Teacher Review',
      timestamp: '2024-01-15 16:20',
      author: 'Teacher',
      content: `# Introduction to React

React is a powerful JavaScript library for building user interfaces, particularly web applications. It was created by Facebook in 2013 and is now maintained by Meta and the open-source community.

## Key Features
- Component-based architecture for reusable, modular code
- Virtual DOM for optimal performance and efficiency
- Declarative programming style that's easier to debug
- Strong ecosystem and active community support
- Excellent developer tools and debugging capabilities
- Server-side rendering support

## Learning Prerequisites
Before diving into React, ensure you're comfortable with:
- JavaScript ES6+ features
- HTML and CSS fundamentals
- Basic programming concepts

## Getting Started
To start with React, you need to understand these core concepts:
1. JSX syntax and how it differs from HTML
2. Components, props, and composition patterns
3. State management and React hooks
4. Event handling and user interactions
5. Component lifecycle and effects
6. Conditional rendering and lists

React makes it easy to create interactive, dynamic, and maintainable user interfaces with minimal effort while following best practices.`,
      changes: 15
    }
  ];

  const generateDiff = (original: string, modified: string): DiffLine[] => {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    const diff: DiffLine[] = [];
    
    let originalIndex = 0;
    let modifiedIndex = 0;
    
    while (originalIndex < originalLines.length || modifiedIndex < modifiedLines.length) {
      const originalLine = originalLines[originalIndex] || '';
      const modifiedLine = modifiedLines[modifiedIndex] || '';
      
      if (originalLine === modifiedLine) {
        diff.push({
          lineNumber: modifiedIndex + 1,
          type: 'unchanged',
          content: modifiedLine,
          originalLineNumber: originalIndex + 1
        });
        originalIndex++;
        modifiedIndex++;
      } else if (originalIndex < originalLines.length && (modifiedIndex >= modifiedLines.length || originalLine !== modifiedLine)) {
        // Line was removed
        diff.push({
          lineNumber: originalIndex + 1,
          type: 'removed',
          content: originalLine,
          originalLineNumber: originalIndex + 1
        });
        originalIndex++;
      } else {
        // Line was added or modified
        diff.push({
          lineNumber: modifiedIndex + 1,
          type: 'added',
          content: modifiedLine,
          originalLineNumber: originalIndex + 1
        });
        modifiedIndex++;
      }
    }
    
    return diff;
  };

  const getDiffData = () => {
    if (!selectedVersions.original || !selectedVersions.modified) {
      return [];
    }
    
    const originalVersion = contentVersions.find(v => v.id === selectedVersions.original);
    const modifiedVersion = contentVersions.find(v => v.id === selectedVersions.modified);
    
    if (!originalVersion || !modifiedVersion) {
      return [];
    }
    
    return generateDiff(originalVersion.content, modifiedVersion.content);
  };

  const diffData = getDiffData();
  const filteredDiff = showOnlyChanges 
    ? diffData.filter(line => line.type !== 'unchanged')
    : diffData;

  const getLineColor = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-l-4 border-green-500 text-green-900';
      case 'removed':
        return 'bg-red-50 border-l-4 border-red-500 text-red-900';
      case 'modified':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900';
      default:
        return 'bg-background';
    }
  };

  const renderSideBySide = () => {
    const originalVersion = contentVersions.find(v => v.id === selectedVersions.original);
    const modifiedVersion = contentVersions.find(v => v.id === selectedVersions.modified);
    
    if (!originalVersion || !modifiedVersion) return null;

    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{originalVersion.title}</CardTitle>
            <CardDescription>{originalVersion.timestamp} by {originalVersion.author}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              {originalVersion.content}
            </pre>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{modifiedVersion.title}</CardTitle>
            <CardDescription>{modifiedVersion.timestamp} by {modifiedVersion.author}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              {modifiedVersion.content}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUnifiedDiff = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Unified Diff View
          </CardTitle>
          <CardDescription>
            Showing changes between selected versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-0 max-h-96 overflow-y-auto">
            {filteredDiff.map((line, index) => (
              <div 
                key={index}
                className={`px-4 py-1 text-sm font-mono ${getLineColor(line.type)}`}
              >
                <div className="flex">
                  {showLineNumbers && (
                    <span className="text-muted-foreground mr-4 select-none w-12 text-right">
                      {line.type === 'removed' ? '-' : ''}
                      {line.type === 'added' ? '+' : ''}
                      {line.lineNumber}
                    </span>
                  )}
                  <span className="flex-1">
                    {line.type === 'removed' && '- '}
                    {line.type === 'added' && '+ '}
                    {line.content}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Side-by-Side Diff Viewer</h1>
          <p className="text-muted-foreground mt-1">
            Compare different versions of your content and track changes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Diff
          </Button>
        </div>
      </div>

      {/* Version Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Versions to Compare</CardTitle>
          <CardDescription>
            Choose two versions of your content to see the differences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Original Version</Label>
              <Select 
                value={selectedVersions.original} 
                onValueChange={(value) => setSelectedVersions(prev => ({ 
                  ...prev, 
                  original: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select original version" />
                </SelectTrigger>
                <SelectContent>
                  {contentVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{version.title}</span>
                        <Badge variant="outline" className="ml-auto">
                          {version.timestamp}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Modified Version</Label>
              <Select 
                value={selectedVersions.modified} 
                onValueChange={(value) => setSelectedVersions(prev => ({ 
                  ...prev, 
                  modified: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select modified version" />
                </SelectTrigger>
                <SelectContent>
                  {contentVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{version.title}</span>
                        <Badge variant="outline" className="ml-auto">
                          {version.timestamp}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* View Options */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Switch 
                id="side-by-side" 
                checked={sideBySide}
                onCheckedChange={setSideBySide}
              />
              <Label htmlFor="side-by-side">Side-by-side view</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="line-numbers" 
                checked={showLineNumbers}
                onCheckedChange={setShowLineNumbers}
              />
              <Label htmlFor="line-numbers">Show line numbers</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="only-changes" 
                checked={showOnlyChanges}
                onCheckedChange={setShowOnlyChanges}
              />
              <Label htmlFor="only-changes">Show only changes</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diff Display */}
      {selectedVersions.original && selectedVersions.modified && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex gap-4">
            <Badge variant="outline" className="text-green-700 bg-green-50">
              +{diffData.filter(line => line.type === 'added').length} additions
            </Badge>
            <Badge variant="outline" className="text-red-700 bg-red-50">
              -{diffData.filter(line => line.type === 'removed').length} deletions
            </Badge>
            <Badge variant="outline">
              {diffData.filter(line => line.type === 'unchanged').length} unchanged
            </Badge>
          </div>

          {/* Content */}
          {sideBySide ? renderSideBySide() : renderUnifiedDiff()}
        </div>
      )}

      {!selectedVersions.original || !selectedVersions.modified ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <GitCompare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Select two versions to compare and see the differences
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}