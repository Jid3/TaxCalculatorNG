const fs = require('fs');
const filepath = 'c:/Users/Jide/Documents/Project Tax 2.0/Taxcalculator/app/onboarding.tsx';
let text = fs.readFileSync(filepath, 'utf-8');

text = text.replace(/import \{ LinearGradient \} from 'expo-linear-gradient';\n?/, '');

text = text.replace(
  /<LinearGradient colors=\{isDarkMode \? \['#121212', '#182b18', '#0c1a0c'\] : \['#FFFFFF', '#eafaf0', '#c2f0c2'\]\} style=\{styles\.container\}>/,
  `<View style={[styles.container, { backgroundColor: isDarkMode ? '#121812' : '#F4FCF4' }]}>`
);

text = text.replace(
  /<\/Animated\.View>\n\s*<\/LinearGradient>/,
  `</Animated.View>\n        </View>`
);

fs.writeFileSync(filepath, text, 'utf-8');
console.log('Reverted gradient successfully');

