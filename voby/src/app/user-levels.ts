export const experienceLevelMapping: Record<number, number> = {
    1000: 10,
    900: 9,
    800: 8,
    700: 7,
    600: 6,
    500: 5,
    400: 4,
    300: 3,
    200: 2,
    100: 1,
    0: 0
}

export interface UserLevel {
    level: number;
    threshold: number;
}