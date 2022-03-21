import {FC, useEffect, useRef, useState} from "react";
import {createChart} from "lightweight-charts";
import {getDbTrtnCirc, getDbTrtnUsdc} from "../../utils/db";

const ChartTrtnUsdc: FC  = () => {
    const chartContainerRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {

            const response = await Promise.all([
                getDbTrtnUsdc(),
                getDbTrtnCirc()
            ]);
            if(chartContainerRef?.current) {
                const chart = createChart(chartContainerRef.current, {
                    // @ts-ignore
                    width: chartContainerRef.current.clientWidth,
                    // @ts-ignore
                    height: chartContainerRef.current.clientHeight,
                    rightPriceScale: {
                        scaleMargins: {
                            top: 0.1,
                            bottom: 0.35,
                        },
                        borderVisible: false,
                    },
                    layout: {
                        backgroundColor: 'transparent',
                        textColor: '#ffffff7d',
                    },
                    grid: {
                        vertLines: {
                            color: '#2B2B43',
                        },
                        horzLines: {
                            color: '#363C4E',
                        },
                    },
                    timeScale: {
                        timeVisible: true,
                        secondsVisible: false,
                        borderColor: '#485c7b',
                        rightOffset: 2,
                    },

                });
                const lineSeries = chart.addAreaSeries({
                    topColor: 'rgba(5,213,161, 0.56)',
                    bottomColor: 'rgba(5,213,161, 0.04)',
                    lineColor: '#05D5A1',
                    lineWidth: 2,
                });

                lineSeries.setData(response[0].data);
                const barSeries = chart.addHistogramSeries({
                    color:  '#257DC9',
                    baseLineColor: '#fff',
                    priceFormat: {
                        type: 'volume',
                    },
                    priceLineWidth: 1,
                    priceScaleId: '',
                    scaleMargins: {
                        top: 0.7,
                        bottom: 0,
                    }
                });
                barSeries.setData(response[1].data);
            }
        }

        fetchData();

    }, [chartContainerRef]);

    return (<div ref={chartContainerRef} className="w-full h-96" />);
}


export default ChartTrtnUsdc;
