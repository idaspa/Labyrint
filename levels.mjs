import ANSI from "./ANSI.mjs";


const level1 =  ANSI.BACKGROUND_COLOR.BLUE + 
 `
█████████████████████████████
█           █               █
█  $        █               █
█           ████████        D
█   B   █                   █
█       █                   █
█   H   █                   █
█████████████████████████████
`

const level2 = ANSI.BACKGROUND_COLOR.YELLOW + `
█████████████████████████████
█          █                █
DH         █      █         █
█      █          █         D 
█      █   B      █     $   █
█████████████████████████████
`

const level3 = ANSI.COLOR.WHITE + `
█████████████████████████████
█     █  $   █        █     █
█     █      █        █     D
█        █████        █     █
█                     █     █
█          █   █      █     █
DH         █ B █            █
█████████████████████████████




`






;


export { level1, level2, level3};
