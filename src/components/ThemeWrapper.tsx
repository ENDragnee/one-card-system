import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

interface ThemeProviderProp {
    children: ReactNode;
}

export function ThemeWrapper({children}: ThemeProviderProp){
    return(
        <ThemeProvider
            attribute={"class"}
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    );
}