export const experienceLevelMapping: Record<number, number> = {
    2600: 10,
    2000: 9,
    1500: 8,
    1200: 7,
    900: 6,
    670: 5,
    500: 4,
    350: 3,
    120: 2,
    50: 1,
    0: 0
}

export interface UserLevel {
    level: number;
    threshold: number;
}