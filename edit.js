const fs = require('fs');
let code = fs.readFileSync('src/app/mod/shift-actions.ts', 'utf8');

// 1. Add normalizeUrl to imports
code = code.replace(
  'robloxLookupSchema,\r\n} from "@/lib/validation";',
  'robloxLookupSchema,\r\n  normalizeUrl,\r\n} from "@/lib/validation";'
);
code = code.replace(
  'robloxLookupSchema,\n} from "@/lib/validation";',
  'robloxLookupSchema,\n  normalizeUrl,\n} from "@/lib/validation";'
);

// 2. Fix the duplicate check
code = code.replace(
  /\/\/ Duplicate check: ensure the exact same evidence link isn't reused[\s\S]*?if \(duplicate\) \{\r?\n\s*return \{ success: false, error: "This evidence link has already been used\." \};\r?\n\s*\}/,
  `const normalizedLink = normalizeUrl(validated.evidenceLink);

    // Duplicate check: ensure the exact same evidence link isn't reused for the SAME target user
    const duplicate = await prisma.modAction.findFirst({
      where: {
        evidenceLink: normalizedLink,
        targetUser: validated.targetUser,
        deletedAt: null,
      },
    });

    if (duplicate) {
      return { success: false, error: "This evidence link has already been used for this specific user." };
    }`
);

// 3. Update creation using normalizedLink
// Since we accidentally replaced it above (wait, did we?), let's just make sure both places use normalizedLink
code = code.replace(
  /evidenceLink: validated\.evidenceLink,/g,
  'evidenceLink: normalizedLink,'
);

fs.writeFileSync('src/app/mod/shift-actions.ts', code);
console.log('Script done!');
