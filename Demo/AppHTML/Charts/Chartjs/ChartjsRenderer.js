import { ChartBase } from "../ChartBase/ChartBase.js";
const availableChartTypes = ['line', 'bar', 'doughnut', 'pie', 'scatter', 'bubble', 'polarArea', 'radar'];

class ChartjsChart extends ChartBase {

    drawChart() {
        super.drawChart();
        this.clearPreviousChart();

        //Explicitly set the height and width again to avoid resize issues when the user alt tabs while the page is loading
        this.chartLocation.height = this.control._eControl.clientHeight;
        this.chartLocation.width = this.control._eControl.clientWidth;

        if (!availableChartTypes.includes(this.chartType)) throw new df.Error(999, 'That chart type does not exist for chartjs!');

        try {

            //Create the chart
            this.currentChart = new Chart(this.chartLocation, {
                type: this.chartType,
                data: {
                    labels: this.xAxisLabels,
                    datasets: this.chartData
                },
                options: {
                    plugins: {
                        subtitle: {
                            display: this.subtitle ?? false,
                            text: this.subtitle
                        },
                        title: {
                            display: true,
                            text: this.title
                        },
                        legend: {
                            position: this.legendAlignment,
                            display: this.legendEnabled
                        },
                        tooltip: {
                            callbacks: {
                                label: function (tooltipItem) {
                                    const customTooltip = tooltipItem.dataset.tooltips[tooltipItem.dataIndex];

                                    //If we have a custom tooltip modify the current tooltip.
                                    if (customTooltip != "") {
                                        const returnTooltip = []
                                        returnTooltip.push(`${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}`)
                                        returnTooltip.push(customTooltip);
                                        //Append the custom tooltip
                                        return returnTooltip;
                                    }
                                },
                            }
                        }
                    },
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: this.yAxisLabel
                            }
                        }
                    },
                    context: this
                }
            });

            //Handle the onclick event for chartjs
            this.chartLocation.onclick = (event) => {
                const res = this.currentChart.getElementsAtEventForMode(
                    event,
                    'nearest',
                    { intersect: true },
                    true
                );
                // If nothing was clicked res will be empty
                if (res.length === 0) {
                    return;
                }

                //Call super class with the acquired info
                this.onClick(
                    this.currentChart.data.labels[res[0].index],
                    this.currentChart.data.datasets[res[0].datasetIndex].data[res[0].index]?.y ?? this.currentChart.data.datasets[res[0].datasetIndex].data[res[0].index],
                    this.currentChart.data.datasets[res[0].datasetIndex].tooltips[res[0].index] ?? '',
                    res[0].index,
                    this.currentChart.data.datasets[res[0].datasetIndex].label
                )
            };

        } catch (error) {
            this.control.set_isSvg(false);
            throw new df.Error(999, error);
        }

    }

    formatData(data) {
        //Modify the data for the specific library
        let newData;

        switch (this.chartType) {
            default:
                newData = {
                    label: data.sLabel,
                    data: data.dataPoints.map(item => item.y),
                    borderColor: data.sSeriesColor,
                    backgroundColor: data.sSeriesColor,
                    type: data.sType,
                    borderWidth: data.nLineThickness ? data.nLineThickness : 2
                }
                break;
            case "pie":
            case "doughnut":
            case "polarArea":
                newData = {
                    label: data.sLabel,
                    data: data.dataPoints.map(item => item.y),
                    tooltips: data.dataPoints.map(item => item.sTooltip)
                }
                break;
            case "scatter":
            case "bubble":
                newData = {
                    label: data.sLabel,
                    data: [],
                    type: data.sType
                }
                for (let index = 0; index < this.xAxisLabels.length; index++) {
                    newData.data[index] = {
                        x: index,
                        y: data.dataPoints[index].y,
                    }
                }
                break;
        }

        newData.tooltips = data.dataPoints.map(item => item.sTooltip)

        return newData;
    }

    addNewSeries(data) {
        data = super.addNewSeries(data);

        this.currentChart.data.datasets.push(data);
        this.currentChart.update();
    }

    addNewDataPoint(datasetIndex, data) {
        //Add the data
        this.chartData[datasetIndex].data.push(data.y);
        this.chartData[datasetIndex].tooltips.push(data.sTooltip);

        this.currentChart.update();
    }

    changeDataPoint(datasetIndex, valueIndex, newValue) {
        this.chartData[datasetIndex].data[valueIndex]?.y
            ? this.chartData[datasetIndex].data[valueIndex].y = newValue
            : this.chartData[datasetIndex].data[valueIndex] = newValue;
        this.currentChart.update();
    }

    removeDataset(datasetIndex) {
        this.currentChart.data.datasets.splice(datasetIndex, 1);
        this.currentChart.update();
    }

}

//Register at chartcontrol
window.addEventListener('load', function (event) {
    df.ChartControl.prototype.registerRenderer(ChartjsChart, false);
})