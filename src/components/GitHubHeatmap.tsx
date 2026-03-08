import { useEffect, useRef, useState } from 'react';
// @ts-ignore
import CalHeatmap from 'cal-heatmap';
import 'cal-heatmap/cal-heatmap.css';
// @ts-ignore
import Tooltip from 'cal-heatmap/plugins/Tooltip';
// @ts-ignore
import LegendLite from 'cal-heatmap/plugins/LegendLite';
// @ts-ignore
import CalendarLabel from 'cal-heatmap/plugins/CalendarLabel';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';

dayjs.extend(localeData);

interface GitHubHeatmapProps {
    username: string;
}

export default function GitHubHeatmap({ username }: GitHubHeatmapProps) {
    const calRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState<number | null>(null);
    const [contributions, setContributions] = useState<any[]>([]);
    const [responsive, setResponsive] = useState({
        range: 12,
        cellSize: 9.5,
    });

    useEffect(() => {
        const updateResponsive = () => {
            const width = window.innerWidth;
            let newSettings;
            if (width < 414) {
                newSettings = { range: 2, cellSize: 18 };
            } else if (width < 480) {
                newSettings = { range: 4, cellSize: 16 };
            } else if (width < 640) {
                newSettings = { range: 6, cellSize: 14 };
            } else if (width < 850) {
                newSettings = { range: 10, cellSize: 10 };
            } else {
                newSettings = { range: 12, cellSize: 8.8 };
            }

            setResponsive(prev =>
                (prev.range !== newSettings.range || prev.cellSize !== newSettings.cellSize)
                    ? newSettings
                    : prev
            );
        };

        window.addEventListener('resize', updateResponsive);
        updateResponsive();
        return () => window.removeEventListener('resize', updateResponsive);
    }, []);

    useEffect(() => {
        setLoading(true);
        fetch(`https://github-contributions-api.deno.dev/${username}.json`)
            .then(res => res.json())
            .then(data => {
                setTotal(data.totalContributions);
                const flattenedData = data.contributions.flat().map((d: any) => ({
                    date: d.date,
                    value: d.contributionCount
                }));
                setContributions(flattenedData);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching GitHub contributions:', err);
                setLoading(false);
            });
    }, [username]);

    useEffect(() => {
        if (!contributions.length || !containerRef.current) return;

        if (calRef.current) {
            try {
                calRef.current.destroy();
                calRef.current = null;
            } catch (e) {
                console.warn('Error destroying CalHeatmap:', e);
            }
        }

        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }

        const cal = new CalHeatmap();

        cal.paint(
            {
                itemSelector: containerRef.current,
                domain: {
                    type: 'month',
                    gutter: 2,
                    label: { text: 'MMM', textAlign: 'start', position: 'top' },
                },
                subDomain: {
                    type: 'ghDay',
                    radius: 2,
                    width: responsive.cellSize,
                    height: responsive.cellSize,
                    gutter: 3
                },
                date: {
                    start: dayjs().subtract(responsive.range - 1, 'month').startOf('month').toDate()
                },
                range: responsive.range,
                data: {
                    source: contributions,
                    type: 'json',
                    x: 'date',
                    y: 'value',
                },
                scale: {
                    color: {
                        type: 'threshold',
                        range: [
                            '#21262d', // Blank grey
                            '#344d3d',
                            '#4c7b52',
                            '#63a06a',
                            '#7a9a65', // Primary green
                        ],
                        domain: [1, 5, 10, 15],
                    },
                },
            },
            [
                [
                    Tooltip,
                    {
                        text: (_date: any, value: any, dayjsDate: any) => {
                            return `${value || 0} contributions on ${dayjsDate.format('dddd, MMMM D, YYYY')}`;
                        },
                    },
                ],
                [
                    LegendLite,
                    {
                        includeBlank: true,
                        itemSelector: '#cal-heatmap-legend',
                        radius: 2,
                        width: responsive.cellSize,
                        height: responsive.cellSize,
                        gutter: 3,
                    },
                ],
                [
                    CalendarLabel,
                    {
                        width: 30,
                        textAlign: 'start',
                        text: () => dayjs.localeData().weekdaysShort().map((d, i) => (i % 2 === 0 ? '' : d)),
                        padding: [22, 0, 0, 0],
                    },
                ],
            ]
        );
        calRef.current = cal;

        return () => {
            if (calRef.current) {
                try {
                    calRef.current.destroy();
                } catch (e) {
                    //ignore
                }
            }
        };
    }, [contributions, responsive]);

    const handlePrevious = (e: React.MouseEvent) => {
        e.preventDefault();
        calRef.current?.previous();
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        calRef.current?.next();
    };

    return (
        <div className="flex flex-col gap-4 w-full p-1 shadow-inner group transition-all">
            <div className="flex justify-between items-end mb-1">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary italic">
                        Contribution Matrix
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {total ? `${total.toLocaleString()} total commits` : loading ? 'Syncing activity...' : 'No activity found'}
                    </p>
                </div>
                {loading && (
                    <div className="flex gap-1 mb-1">
                        <div className="w-1 h-1 bg-primary animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1 h-1 bg-primary animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1 h-1 bg-primary animate-bounce" />
                    </div>
                )}
            </div>

            <div className="relative flex justify-center w-full overflow-hidden">
                <div ref={containerRef} className="max-w-full" />

                {/* Decorative els */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary/20 pointer-events-none group-hover:border-primary/50 transition-colors" />
                <div className="absolute bottom-4 left-0 w-2 h-2 border-b-2 border-l-2 border-primary/20 pointer-events-none group-hover:border-primary/50 transition-colors" />
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <button
                        onClick={handlePrevious}
                        className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold bg-muted/30 hover:bg-primary hover:text-background rounded transition-all active:scale-95"
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold bg-muted/30 hover:bg-primary hover:text-background rounded transition-all active:scale-95"
                    >
                        Next →
                    </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                    <span className="opacity-60">Less</span>
                    <div id="cal-heatmap-legend" className="flex items-center"></div>
                    <span className="opacity-60">More</span>
                </div>
            </div>
        </div>
    );
}
