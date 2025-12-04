import { ChartBase } from "../ChartBase/ChartBase.js";
const availableChartTypes = ['line', 'bar', 'column', 'area', 'pie', 'areaspline', 'scatter', 'spline'];

class HighChartsChart extends ChartBase {

    drawChart() {
        super.drawChart();

        if (!availableChartTypes.includes(this.chartType)) throw new df.Error(999, 'HighCharts does not support this chart type!');

        try {

            //Create the highcharts chart object
            this.currentChart = Highcharts.chart(this.chartLocation, {
                chart: {
                    type: this.chartType == "doughnut" ? "pie" : this.chartType,
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
                    title: {
                        text: this.yAxisLabel
                    }
                },
                //Define the xAxis
                xAxis: {
                    categories: this.xAxisLabels
                },
                //Information about the legend
                legend: {
                    layout: 'vertical',
                    align: this.legendAlignment,
                    enabled: this.legendEnabled,
                    verticalAlign: 'middle'
                },

                tooltip: {
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

        switch (this.chartType) {
            default:
                newData = {
                    name: data.sLabel,
                    data: data.dataPoints,
                    color: data.sSeriesColor,
                    type: data.sType,
                    lineWidth: data.nLineThickness ? data.nLineThickness : 2
                }
                break;
            case "pie":
            case "pyramid":
            case "funnel":
            case "doughnut":
                newData = {
                    name: data.sLabel,
                    data: [],
                    type: data.sType,
                    innerSize: this.chartType == "doughnut" ? '50%' : '0%'
                }
                for (let index = 0; index < this.xAxisLabels.length; index++) {
                    newData.data[index] = {
                        name: this.xAxisLabels[index],
                        y: data.dataPoints[index].y,
                        sTooltip: data.dataPoints[index].sTooltip
                    }
                }
                break;
            case "scatter":
                newData = {
                    name: data.sLabel,
                    data: [],
                    type: data.sType
                }
                for (let index = 0; index < this.xAxisLabels.length; index++) {
                    newData.data[index] = [
                        this.xAxisLabels[index],
                        data.dataPoints[index].y,
                        data.dataPoints[index].sTooltip
                    ]
                }
                break;

        }

        return newData;
    }

    addNewSeries(data) {
        data = super.addNewSeries(data);
        this.currentChart.addSeries(data);
    }

    addNewDataPoint(datasetIndex, data) {
        this.currentChart.series[datasetIndex].addPoint(data);
    }

    changeDataPoint(datasetIndex, valueIndex, newValue) {
        this.currentChart.series[datasetIndex].data[valueIndex].update(newValue);
    }

    removeDataset(datasetIndex) {
        this.currentChart.series[datasetIndex].remove();
    }

}

//Register at chartcontrol
window.addEventListener('load', function (event) {
    df.ChartControl.prototype.registerRenderer(HighChartsChart, true);
})