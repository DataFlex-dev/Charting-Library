import { ChartBase, HoverBehavior, TooltipLocation } from "../ChartBase/ChartBase.js";
const availableChartTypes = ['line', 'bar', 'column', 'area', 'pie', 'doughnut', 'areaspline', 'scatter', 'spline'];

class HighChartsChart extends ChartBase {

    drawChart() {
        super.drawChart();

        if (!availableChartTypes.includes(this.chartType)) throw new df.Error(999, 'HighCharts does not support this chart type!');

        try {

            //Create the highcharts chart object
            this.currentChart = Highcharts.chart(this.chartLocation, {
                chart: {
                    type: this.chartType === "doughnut" ? "pie" : this.chartType,
                    backgroundColor: this.backgroundColor,
                    panning: this.zoomable,
                    panKey: "shift",

                    zooming: {
                        type: this.zoomable ? "xy" : undefined,
                    }
                },

                credits: {
                    enabled: false
                },

                accessibility: {
                    enabled: false
                },
                //Define the subtitle that is displayed above the chart, but under the title
                subtitle: {
                    text: this.subtitle
                },
                //Define the title that is displayed above the chart
                title: {
                    text: this.title
                },
                //Define the yAxis
                yAxis: {
                    visible: this.showYAxis,
                    title: {
                        text: this.yAxisLabel
                    }
                },
                //Define the xAxis
                xAxis: {
                    visible: this.showXAxis,
                    categories: this.xAxisLabels,
                    labels: {
                        autoRotation: [...new Set([this.xAxisLabelMinRotation, this.xAxisLabelMaxRotation])]
                    }
                },
                //Information about the legend
                legend: {
                    layout: 'vertical',
                    align: this.legendAlignment,
                    enabled: this.legendEnabled,
                    verticalAlign: 'middle'
                },

                tooltip: {
                    shared: this.hoverBehavior === HoverBehavior.hbIndex,
                    followPointer: this.tooltipLocation === TooltipLocation.tlNearest,
                    pointFormat: '{series.name}: <b>{point.y}</b><br/>{point.sTooltip}'
                },

                plotOptions: {
                    series: {
                        point: {
                            events: {
                                //Handle the onclick event
                                click: (e) => {
                                    if (e.point.category !== undefined) {
                                        this.onClick(e.point.category, e.point.y, e.point.sTooltip, e.point.index, e.point.series.name);
                                    } else {
                                        this.onClick(e.point.dataLabel.textStr, e.point.y, e.point.sTooltip, e.point.index, e.point.series.name);
                                    }
                                }
                            }
                        }
                    }
                },

                series: this.chartData,
            });
        } catch (error) {
            throw new df.Error(999, error);
        }
    }

    formatData(data) {
        //Modify the data for the specific library and charttype
        let newData;
        const pointOptions = (item, extra = {}) => {
            const color = item.sBackgroundColor || data.sPointBackgroundColor || data.sSeriesColor || undefined;
            const borderColor = item.sBorderColor || data.sPointBorderColor || data.sSeriesColor || undefined;
            const hoverColor = item.sHoverBackgroundColor || data.sPointHoverBackgroundColor || color;
            const hoverBorderColor = item.sHoverBorderColor || data.sPointHoverBorderColor || borderColor;

            return {
                ...extra,
                y: item.y,
                sTooltip: item.sTooltip,
                color,
                borderColor,
                borderWidth: data.nPointBorderWidth || 1,
                marker: {
                    radius: data.nPointRadius || 3,
                    fillColor: color,
                    lineColor: borderColor,
                    lineWidth: data.nPointBorderWidth || 1,
                    states: {
                        hover: {
                            radius: data.nPointHoverRadius || 4,
                            fillColor: hoverColor,
                            lineColor: hoverBorderColor,
                            lineWidth: data.nPointBorderWidth || 1
                        }
                    }
                },
                states: {
                    hover: {
                        color: hoverColor,
                        borderColor: hoverBorderColor
                    }
                }
            };
        };

        switch (this.chartType) {
            default:
                newData = {
                    name: data.sLabel,
                    data: data.dataPoints.map(item => pointOptions(item)),
                    color: data.sSeriesColor,
                    type: data.nTension && (!data.sType || data.sType === 'line') ? 'spline' : data.sType,
                    lineWidth: data.nLineThickness || 2
                }
                break;
            case "pie":
            case "doughnut":
                newData = {
                    name: data.sLabel,
                    data: [],
                    type: data.sType,
                    innerSize: this.chartType === "doughnut" ? '50%' : '0%'
                }
                for (let index = 0; index < this.xAxisLabels.length; index++) {
                    newData.data[index] = pointOptions(data.dataPoints[index], {
                        name: this.xAxisLabels[index]
                    });
                }
                break;
            case "scatter":
                newData = {
                    name: data.sLabel,
                    data: [],
                    type: data.sType
                }
                for (let index = 0; index < this.xAxisLabels.length; index++) {
                    newData.data[index] = pointOptions(data.dataPoints[index], {
                        x: this.xAxisLabels[index],
                    });
                }
                break;

        }

        newData._pointOptions = pointOptions;
        return newData;
    }

    addNewSeries(data) {
        data = super.addNewSeries(data);
        this.currentChart.addSeries(data);
    }

    addNewDataPoint(datasetIndex, data) {
        this.currentChart.series[datasetIndex].addPoint(this.chartData[datasetIndex]._pointOptions(data));
    }

    changeDataPoint(datasetIndex, valueIndex, newValue) {
        this.currentChart.series[datasetIndex].data[valueIndex].update(newValue);
    }

    removeDataset(datasetIndex) {
        super.removeDataset(datasetIndex);
        this.currentChart.series[datasetIndex].remove();
    }

}

//Register at chartcontrol
window.addEventListener('load', function (event) {
    df.ChartControl.prototype.registerRenderer("HighCharts", HighChartsChart, true);
})
