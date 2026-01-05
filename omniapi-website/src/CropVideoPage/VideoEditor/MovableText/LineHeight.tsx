export const FONT_LINE_HEIGHTS:Record<string,number> = {
  "Arial": .74,
  "Arial Black": .75,  // Bolder fonts often look better with tighter spacing
  "Book Antiqua": .668,
  "Bookman Old Style": 1.2,
  "Comic Sans MS": 1.3,
  "Courier": 1.1,
  "Courier New": 1.1,
  "Georgia": 1.25,
  "Garamond": 1.2,
  "Impact": 0.9,       // Impact is designed to be very tight
  "Lucida Console": 1.2,
  "Lucida Sans Unicode": 1.2,
  "MS Sans Serif": 1.2,
  "MS Serif": 1.2,
  "Palatino Linotype": 1.25,
  "Tahoma": 1.2,
  "Times New Roman": 1.2,
  "Trebuchet MS": 1.2,
  "Verdana": 1.3,      // Verdana is a wide font, needs breathing room
  "Helvetica": 1.2,
  "Geneva": 1.2,
  "Brush Script MT": 1.5, // Script fonts need room for loops/tails
  "Avant Garde": 1.1,
  "Century Gothic": 1.1,
  "Copperplate Gothic Light": 1.1,
  "Gill Sans": 1.1,
  "Monaco": 1.2,
  "Consolas": 1.2,
  "Andale Mono": 1.2,
  "Wingdings": 1.0,
};

// Helper function to safely get height with a fallback
export const getLineHeight = (fontName:string) => {
  return FONT_LINE_HEIGHTS[fontName] || 1.2; 
};