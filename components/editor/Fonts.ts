export interface FontOption {
  label: string;
  value: string; // CSS font-family stack passed straight to Tiptap's setFontFamily
}

export const FONTS: FontOption[] = [
  // Serif
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Merriweather", value: "'Merriweather', serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Lora", value: "'Lora', serif" },
  { label: "PT Serif", value: "'PT Serif', serif" },
  { label: "Crimson Text", value: "'Crimson Text', serif" },
  { label: "Libre Baskerville", value: "'Libre Baskerville', serif" },
  { label: "EB Garamond", value: "'EB Garamond', serif" },
  { label: "Bitter", value: "'Bitter', serif" },
  { label: "Cormorant Garamond", value: "'Cormorant Garamond', serif" },
  { label: "Spectral", value: "'Spectral', serif" },
  { label: "Source Serif Pro", value: "'Source Serif Pro', serif" },
  { label: "Noto Serif", value: "'Noto Serif', serif" },
  { label: "Vollkorn", value: "'Vollkorn', serif" },

  // Sans-serif
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Lato", value: "'Lato', sans-serif" },
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
  { label: "Poppins", value: "'Poppins', sans-serif" },
  { label: "Nunito", value: "'Nunito', sans-serif" },
  { label: "Work Sans", value: "'Work Sans', sans-serif" },
  { label: "Rubik", value: "'Rubik', sans-serif" },
  { label: "Mulish", value: "'Mulish', sans-serif" },
  { label: "Karla", value: "'Karla', sans-serif" },
  { label: "DM Sans", value: "'DM Sans', sans-serif" },
  { label: "Quicksand", value: "'Quicksand', sans-serif" },
  { label: "Raleway", value: "'Raleway', sans-serif" },
  { label: "Manrope", value: "'Manrope', sans-serif" },
  { label: "Josefin Sans", value: "'Josefin Sans', sans-serif" },

  // Display / headline
  { label: "Oswald", value: "'Oswald', sans-serif" },
  { label: "Bebas Neue", value: "'Bebas Neue', sans-serif" },
  { label: "Abril Fatface", value: "'Abril Fatface', serif" },
  { label: "Anton", value: "'Anton', sans-serif" },
  { label: "Fjalla One", value: "'Fjalla One', sans-serif" },
  { label: "Cinzel", value: "'Cinzel', serif" },
  { label: "Cormorant", value: "'Cormorant', serif" },
  { label: "Marcellus", value: "'Marcellus', serif" },

  // Handwriting / script
  { label: "Caveat", value: "'Caveat', cursive" },
  { label: "Dancing Script", value: "'Dancing Script', cursive" },
  { label: "Pacifico", value: "'Pacifico', cursive" },
  { label: "Sacramento", value: "'Sacramento', cursive" },
  { label: "Shadows Into Light", value: "'Shadows Into Light', cursive" },
  { label: "Kalam", value: "'Kalam', cursive" },

  // Monospace
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "Fira Code", value: "'Fira Code', monospace" },
  { label: "Source Code Pro", value: "'Source Code Pro', monospace" },

  // System
  { label: "System UI", value: "system-ui, -apple-system, sans-serif" },
];

// Drop this <link> in your root layout's <head> so these actually render
// instead of silently falling back to system fonts.
export const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Merriweather&family=Playfair+Display&family=Lora&family=PT+Serif&family=Crimson+Text&family=Libre+Baskerville&family=EB+Garamond&family=Bitter&family=Cormorant+Garamond&family=Spectral&family=Source+Serif+Pro&family=Noto+Serif&family=Vollkorn&family=Inter&family=Roboto&family=Open+Sans&family=Lato&family=Montserrat&family=Poppins&family=Nunito&family=Work+Sans&family=Rubik&family=Mulish&family=Karla&family=DM+Sans&family=Quicksand&family=Raleway&family=Manrope&family=Josefin+Sans&family=Oswald&family=Bebas+Neue&family=Abril+Fatface&family=Anton&family=Fjalla+One&family=Cinzel&family=Cormorant&family=Marcellus&family=Caveat&family=Dancing+Script&family=Pacifico&family=Sacramento&family=Shadows+Into+Light&family=Kalam&family=JetBrains+Mono&family=Fira+Code&family=Source+Code+Pro&display=swap";