interface FooterLink {
    id: number;
    title: string;
    links: {
        title: string;
        href: string;
    }[];
}

export const footerLinks: FooterLink[] = [
    {
        id: 1,
        title: 'About',
        links: [
            {
                title: 'Company',
                href: '#'
            },
            {
                title: 'Customers',
                href: '#'
            },
            {
                title: 'Blog',
                href: '#'
            }
        ]
    },
    {
        id: 2,
        title: 'Support',
        links: [
            {
                title: 'Help Center',
                href: '#'
            },
            {
                title: 'Safety Center',
                href: '#'
            }
        ]
    },
    {
        id: 3,
        title: 'Legal',
        links: [
            {
                title: 'Cookies Policy',
                href: '#'
            },
            {
                title: 'Privacy Policy',
                href: '#'
            },
            {
                title: 'Terms of Service',
                href: '#'
            }
        ]
    },
];