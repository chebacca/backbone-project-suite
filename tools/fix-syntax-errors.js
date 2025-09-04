const fs = require('fs');
const path = require('path');

// Set to false to actually apply the changes
const DRY_RUN = false;

// Get the current working directory
const cwd = process.cwd();
console.log('Current working directory:', cwd);

// Function to fix specific errors in MessagingLayout.tsx
function fixMessagingLayout(content) {
  console.log('Fixing MessagingLayout.tsx...');
  let fixCount = 0;
  
  // Replace all occurrences of malformed ternary operators
  const patterns = [
    {
      pattern: /\((.*?) && Array\.isArray\((.*?)\) \? (.*?)\)\) : \[\]/g,
      replacement: '$1 && Array.isArray($2) ? $3 : []'
    },
    {
      pattern: /\((.*?) && Array\.isArray\((.*?)\) \? (.*?)\)/g,
      replacement: '$1 && Array.isArray($2) ? $3 : []'
    },
    {
      pattern: /\((.*?)\)\) : \[\]/g,
      replacement: '$1)'
    },
    {
      pattern: /\((.*?)\) : \[\]/g,
      replacement: '$1'
    },
    {
      pattern: /\.(name && Array\.isArray\(name\) \? name\.includes\((.*?)\)\) : false/g,
      replacement: '.name?.includes($1)'
    },
    {
      pattern: /session\.\(participants && Array\.isArray\(participants\) \? participants/g,
      replacement: 'session.participants'
    },
    {
      pattern: /\(participants && Array\.isArray\(participants\) \? participants/g,
      replacement: 'participants'
    }
  ];
  
  let fixedContent = content;
  
  for (const { pattern, replacement } of patterns) {
    const matches = fixedContent.match(pattern);
    if (matches) {
      console.log(`Found ${matches.length} matches for pattern:`, pattern);
      fixCount += matches.length;
      fixedContent = fixedContent.replace(pattern, replacement);
    }
  }
  
  console.log(`🎉 Fixed ${fixCount} syntax errors in MessagingLayout.tsx`);
  return fixedContent;
}

// Function to fix specific errors in MessageConversationView.tsx
function fixMessageConversationView(content) {
  console.log('Fixing MessageConversationView.tsx...');
  let fixCount = 0;
  
  // Replace all occurrences of malformed ternary operators
  const patterns = [
    {
      pattern: /\{(\s*\(messages && Array\.isArray\(messages\) \? messages\.map\(\(message, index\)\)) : \[\] => \{/g,
      replacement: '{messages.map((message, index) => {'
    },
    {
      pattern: /: `\$\{(\(typingUserNames && Array\.isArray\(typingUserNames\) \? typingUserNames\.slice\(0, -1\)\)) : \[\]\.join\(', '\)} and \$\{typingUserNames\[typingUserNames\.length - 1\]} are typing\.\.\.`/g,
      replacement: ': `${typingUserNames.slice(0, -1).join(\', \')} and ${typingUserNames[typingUserNames.length - 1]} are typing...`'
    },
    {
      pattern: /\{(\s*\(attachments && Array\.isArray\(attachments\) \? attachments\.map\(\(attachment, index\)\)) : \[\] => \(/g,
      replacement: '{attachments.map((attachment, index) => ('
    }
  ];
  
  let fixedContent = content;
  
  for (const { pattern, replacement } of patterns) {
    const matches = fixedContent.match(pattern);
    if (matches) {
      console.log(`Found ${matches.length} matches for pattern:`, pattern);
      fixCount += matches.length;
      fixedContent = fixedContent.replace(pattern, replacement);
    }
  }
  
  console.log(`🎉 Fixed ${fixCount} syntax errors in MessageConversationView.tsx`);
  return fixedContent;
}

// Function to fix specific errors in MessagingContext.tsx
function fixMessagingContext(content) {
  console.log('Fixing MessagingContext.tsx...');
  let fixCount = 0;
  
  // Replace all occurrences of malformed ternary operators
  const patterns = [
    {
      pattern: /return \(prevSessions && Array\.isArray\(prevSessions\) \? prevSessions\.map\(session => \{/g,
      replacement: 'return prevSessions.map(session => {'
    },
    {
      pattern: /\}) : \[\]);/g,
      replacement: '});'
    },
    {
      pattern: /setMessageSessions\(prev => \(prev && Array\.isArray\(prev\) \? prev\.filter\(s => s\.id !== sessionId\)\) : \[\]\);/g,
      replacement: 'setMessageSessions(prev => prev.filter(s => s.id !== sessionId));'
    },
    {
      pattern: /console\.log\('Creating group session with contacts:', \(contacts && Array\.isArray\(contacts\) \? contacts\.map\(c => \(\{/g,
      replacement: 'console.log(\'Creating group session with contacts:\', contacts.map(c => ({'
    },
    {
      pattern: /\}\)\) : \[\]\)\);/g,
      replacement: '})));'
    }
  ];
  
  let fixedContent = content;
  
  for (const { pattern, replacement } of patterns) {
    const matches = fixedContent.match(pattern);
    if (matches) {
      console.log(`Found ${matches.length} matches for pattern:`, pattern);
      fixCount += matches.length;
      fixedContent = fixedContent.replace(pattern, replacement);
    }
  }
  
  console.log(`🎉 Fixed ${fixCount} syntax errors in MessagingContext.tsx`);
  return fixedContent;
}

// Files to fix with their corresponding fix functions
const filesToFix = [
  {
    path: path.join(cwd, 'src/features/chat/user-messaging/components/MessagingLayout.tsx'),
    fixFn: fixMessagingLayout
  },
  {
    path: path.join(cwd, 'src/features/chat/user-messaging/components/MessageConversationView.tsx'),
    fixFn: fixMessageConversationView
  },
  {
    path: path.join(cwd, 'src/features/chat/user-messaging/MessagingContext.tsx'),
    fixFn: fixMessagingContext
  }
];

// Process each file
filesToFix.forEach(({ path: filePath, fixFn }) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }
    
    console.log(`Processing file: ${filePath}`);
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = fixFn(content);
    
    // Write back if changes were made and not in dry run mode
    if (fixedContent !== content) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`Changes applied to ${path.basename(filePath)}`);
      } else {
        console.log(`DRY RUN - No changes applied to ${path.basename(filePath)}`);
      }
    } else {
      console.log(`No changes needed in ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log('\nSyntax error fixing completed!');
if (DRY_RUN) {
  console.log('This was a dry run - no files were modified.');
  console.log('To apply changes, set DRY_RUN = false in the script.');
}