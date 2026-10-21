"use client";

import { useEffect, useRef } from "react";
import { ColorType, createChart, ISeriesApi, LineSeries, UTCTimestamp, type IChartApi } from "lightweight-charts";
import type { PriceTick } from "@/types/models";


export function PriceChart({ ticks }: { ticks: PriceTick[] }){
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

    useEffect(() => {
        if(!containerRef.current){
            return;
        }

        const chart = createChart(containerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "#93959C",
                fontFamily: "var(--font-plex-mono)",
            }, 
            grid: {
                vertLines: { color: "#242A36" },
                horzLines: { color: "#242A36" },
            },
            rightPriceScale: { borderColor: "#333947" },
            timeScale: { borderColor: "#333947", timeVisible: true, secondsVisible: true },
            autoSize: true,
        })

        const series = chart.addSeries(LineSeries, {
            color: "#C9A24B",
            lineWidth: 2,
            priceLineColor: "#C9A24B",
        });

        chartRef.current = chart;
        seriesRef.current = series;

        return () => chart.remove();
    }, []);

    useEffect(() => {
        if(!seriesRef.current || ticks.length === 0){
            return;
        }

        const data = ticks.map((t) => ({
            time: Math.floor(new Date(t.ts).getTime() / 1000) as UTCTimestamp,
            value: t.price,
        }));

        seriesRef.current.setData(data);
        chartRef.current?.timeScale().scrollToRealTime();
    }, [ticks]);

    return <div ref={containerRef} className="h-full w-full"/>
}