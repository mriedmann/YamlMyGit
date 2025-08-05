export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: number;
  originalLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffResult {
  lines: DiffLine[];
  addedLines: number;
  removedLines: number;
  totalLines: number;
}

// Normalize text by removing trailing newlines and normalizing line endings
function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize Windows line endings
    .replace(/\r/g, '\n')   // Normalize Mac line endings
    .split('\n')
    .map(line => line.trimEnd()) // Remove trailing whitespace from each line
    .join('\n')
    .replace(/\n+$/, '');   // Remove trailing newlines
}

export function computeDiff(originalText: string, newText: string): DiffResult {
  const normalizedOriginal = normalizeText(originalText);
  const normalizedNew = normalizeText(newText);
  
  const originalLines = normalizedOriginal.split('\n');
  const newLines = normalizedNew.split('\n');
  
  const diffLines: DiffLine[] = [];
  let addedLines = 0;
  let removedLines = 0;
  
  // Simple diff algorithm - can be improved with more sophisticated algorithms
  const maxLength = Math.max(originalLines.length, newLines.length);
  
  for (let i = 0; i < maxLength; i++) {
    const originalLine = originalLines[i] || '';
    const newLine = newLines[i] || '';
    
    if (originalLine === newLine) {
      // Lines are identical
      diffLines.push({
        type: 'unchanged',
        content: originalLine,
        lineNumber: i + 1,
        originalLineNumber: i + 1,
        newLineNumber: i + 1
      });
    } else if (i >= originalLines.length) {
      // New line added
      diffLines.push({
        type: 'added',
        content: newLine,
        lineNumber: i + 1,
        newLineNumber: i + 1
      });
      addedLines++;
    } else if (i >= newLines.length) {
      // Line removed
      diffLines.push({
        type: 'removed',
        content: originalLine,
        lineNumber: i + 1,
        originalLineNumber: i + 1
      });
      removedLines++;
    } else {
      // Lines are different - show both
      diffLines.push({
        type: 'removed',
        content: originalLine,
        lineNumber: i + 1,
        originalLineNumber: i + 1
      });
      removedLines++;
      
      diffLines.push({
        type: 'added',
        content: newLine,
        lineNumber: i + 1,
        newLineNumber: i + 1
      });
      addedLines++;
    }
  }
  
  return {
    lines: diffLines,
    addedLines,
    removedLines,
    totalLines: diffLines.length
  };
}

export function computeInlineDiff(originalText: string, newText: string): DiffResult {
  const normalizedOriginal = normalizeText(originalText);
  const normalizedNew = normalizeText(newText);
  
  const originalLines = normalizedOriginal.split('\n');
  const newLines = normalizedNew.split('\n');
  
  const diffLines: DiffLine[] = [];
  let addedLines = 0;
  let removedLines = 0;
  
  // More sophisticated diff that tries to match similar lines
  let originalIndex = 0;
  let newIndex = 0;
  
  while (originalIndex < originalLines.length || newIndex < newLines.length) {
    const originalLine = originalLines[originalIndex];
    const newLine = newLines[newIndex];
    
    if (originalLine === newLine) {
      // Lines match
      diffLines.push({
        type: 'unchanged',
        content: originalLine,
        lineNumber: originalIndex + 1,
        originalLineNumber: originalIndex + 1,
        newLineNumber: newIndex + 1
      });
      originalIndex++;
      newIndex++;
    } else {
      // Look ahead to see if we can find a match
      let foundMatch = false;
      
      // Check if next few lines in new text match current original line
      for (let lookAhead = 1; lookAhead <= 3 && newIndex + lookAhead < newLines.length; lookAhead++) {
        if (originalLine === newLines[newIndex + lookAhead]) {
          // Add the lines that were inserted
          for (let j = 0; j < lookAhead; j++) {
            diffLines.push({
              type: 'added',
              content: newLines[newIndex + j],
              lineNumber: newIndex + j + 1,
              newLineNumber: newIndex + j + 1
            });
            addedLines++;
          }
          newIndex += lookAhead;
          foundMatch = true;
          break;
        }
      }
      
      if (!foundMatch) {
        // Check if next few lines in original text match current new line
        for (let lookAhead = 1; lookAhead <= 3 && originalIndex + lookAhead < originalLines.length; lookAhead++) {
          if (newLine === originalLines[originalIndex + lookAhead]) {
            // Add the lines that were removed
            for (let j = 0; j < lookAhead; j++) {
              diffLines.push({
                type: 'removed',
                content: originalLines[originalIndex + j],
                lineNumber: originalIndex + j + 1,
                originalLineNumber: originalIndex + j + 1
              });
              removedLines++;
            }
            originalIndex += lookAhead;
            foundMatch = true;
            break;
          }
        }
      }
      
      if (!foundMatch) {
        // No match found, treat as replacement
        if (originalLine !== undefined) {
          diffLines.push({
            type: 'removed',
            content: originalLine,
            lineNumber: originalIndex + 1,
            originalLineNumber: originalIndex + 1
          });
          removedLines++;
        }
        
        if (newLine !== undefined) {
          diffLines.push({
            type: 'added',
            content: newLine,
            lineNumber: newIndex + 1,
            newLineNumber: newIndex + 1
          });
          addedLines++;
        }
        
        originalIndex++;
        newIndex++;
      }
    }
  }
  
  return {
    lines: diffLines,
    addedLines,
    removedLines,
    totalLines: diffLines.length
  };
} 