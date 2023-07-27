interface HighlightsButton {
    name: string;
    current: boolean;
}

export const highlightsButtons: HighlightsButton[] = [
    {
        name: 'Featured',
        current: true
    },
    {
        name: 'Popular',
        current: false
    },
    {
        name: 'New',
        current: false
    }
];