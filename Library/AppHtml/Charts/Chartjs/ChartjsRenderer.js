import { ChartBase, HoverBehavior, TooltipLocation } from "../ChartBase/ChartBase.js";
const availableChartTypes = ['line', 'bar', 'doughnut', 'pie', 'scatter', 'bubble', 'polarArea', 'radar'];

class ChartjsChart extends ChartBase {

    drawChart() {
        super.drawChart();

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
                    datasets: [...this.chartData]
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
                            position: this.tooltipLocation === TooltipLocation.tlAverage ? 'average' : 'nearest',
                            callbacks: {
                                labelColor: function (tooltipItem) {
                                    const color = tooltipItem.element.options.borderColor;
                                    return { borderColor: color, backgroundColor: color, borderWidth: 0 };
                                },
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
                    interaction: {
                        mode: this.hoverBehavior === HoverBehavior.hbIndex ? 'index' : 'nearest',
                        intersect: true
                    },
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: {
                        x: {
                            display: this.showXAxis,
                            ticks: {
                                minRotation: this.xAxisLabelMinRotation,
                                maxRotation: this.xAxisLabelMaxRotation
                            }
                        },
                        y: {
                            display: this.showYAxis,
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
        const seriesColor = data.sSeriesColor || undefined;
        const colorOption = (property, fallback) => data.dataPoints.some(item => item[property])
            ? data.dataPoints.map(item => item[property] || fallback)
            : fallback;
        const defaults = {
            sBackgroundColor: data.sPointBackgroundColor || seriesColor,
            sHoverBackgroundColor: data.sPointHoverBackgroundColor || undefined,
            sBorderColor: data.sPointBorderColor || seriesColor,
            sHoverBorderColor: data.sPointHoverBorderColor || undefined
        };
        const backgroundColors = colorOption('sBackgroundColor', defaults.sBackgroundColor);
        const hoverBackgroundColors = colorOption('sHoverBackgroundColor', defaults.sHoverBackgroundColor);
        const borderColors = colorOption('sBorderColor', defaults.sBorderColor);
        const hoverBorderColors = colorOption('sHoverBorderColor', defaults.sHoverBorderColor);
        const copyColors = colors => Array.isArray(colors) ? [...colors] : colors;
        const type = data.sType || this.chartType;
        const hasPointColorOverrides = data.dataPoints.some(item => item.sBackgroundColor || item.sBorderColor);
        const pointColorsMatch = data.dataPoints.every(item =>
                (item.sBackgroundColor || defaults.sBackgroundColor)
                === (item.sBorderColor || defaults.sBorderColor)
            );

        switch (this.chartType) {
            default:
                newData = {
                    label: data.sLabel,
                    data: data.dataPoints.map(item => item.y),
                    borderColor: type === 'bar' ? copyColors(borderColors) : seriesColor,
                    backgroundColor: type === 'bar' ? copyColors(backgroundColors) : seriesColor,
                    type: data.sType,
                    tension: data.nTension || undefined,
                    borderWidth: type === 'bar' && hasPointColorOverrides && pointColorsMatch ? 0 : data.nLineThickness || 2,
                    pointRadius: data.nPointRadius ? data.nPointRadius : 3,
                    pointHoverRadius: data.nPointHoverRadius ? data.nPointHoverRadius : 4,
                    pointBackgroundColor: copyColors(backgroundColors),
                    pointHoverBackgroundColor: copyColors(hoverBackgroundColors),
                    pointBorderColor: copyColors(borderColors),
                    pointHoverBorderColor: copyColors(hoverBorderColors),
                    pointBorderWidth: data.nPointBorderWidth ? data.nPointBorderWidth : 1
                }
                break;
            case "pie":
            case "doughnut":
            case "polarArea":
                newData = {
                    label: data.sLabel,
                    data: data.dataPoints.map(item => item.y),
                    tooltips: data.dataPoints.map(item => item.sTooltip),
                    backgroundColor: copyColors(backgroundColors),
                    hoverBackgroundColor: copyColors(hoverBackgroundColors),
                    borderColor: copyColors(borderColors),
                    hoverBorderColor: copyColors(hoverBorderColors),
                    borderWidth: hasPointColorOverrides && pointColorsMatch ? 0 : undefined
                }
                break;
            case "scatter":
            case "bubble":
                newData = {
                    label: data.sLabel,
                    data: [],
                    type: data.sType,
                    pointRadius: data.nPointRadius ? data.nPointRadius : 3,
                    pointHoverRadius: data.nPointHoverRadius ? data.nPointHoverRadius : 4,
                    pointBackgroundColor: copyColors(backgroundColors),
                    pointHoverBackgroundColor: copyColors(hoverBackgroundColors),
                    pointBorderColor: copyColors(borderColors),
                    pointHoverBorderColor: copyColors(hoverBorderColors),
                    pointBorderWidth: data.nPointBorderWidth ? data.nPointBorderWidth : 1
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
        newData._pointColorDefaults = defaults;
        newData._hasPointColorOverrides = hasPointColorOverrides;
        newData._pointColorsMatch = pointColorsMatch;
        newData._defaultBorderWidth = data.nLineThickness || 2;

        return newData;
    }

    addNewSeries(data) {
        data = super.addNewSeries(data);

        this.currentChart.data.datasets.push(data);
        this.currentChart.update();
    }

    addNewDataPoint(datasetIndex, data) {
        //Add the data
        const dataset = this.chartData[datasetIndex];
        dataset.data.push(data.y);
        dataset.tooltips.push(data.sTooltip);

        const pointIndex = dataset.data.length - 1;
        const type = dataset.type || this.chartType;
        const options = [
            ['pointBackgroundColor', 'sBackgroundColor'],
            ['pointHoverBackgroundColor', 'sHoverBackgroundColor'],
            ['pointBorderColor', 'sBorderColor'],
            ['pointHoverBorderColor', 'sHoverBorderColor']
        ];
        if (['bar', 'pie', 'doughnut', 'polarArea'].includes(type)) {
            options.push(
                ['backgroundColor', 'sBackgroundColor'],
                ['hoverBackgroundColor', 'sHoverBackgroundColor'],
                ['borderColor', 'sBorderColor'],
                ['hoverBorderColor', 'sHoverBorderColor']
            );
        }
        for (const [property, field] of options) {
            const colors = dataset[property];
            const fallback = dataset._pointColorDefaults[field];
            if (Array.isArray(colors)) {
                colors.push(data[field] || fallback);
            } else if (data[field]) {
                dataset[property] = Array(pointIndex).fill(colors || fallback).concat(data[field]);
            }
        }
        const backgroundColor = data.sBackgroundColor || dataset._pointColorDefaults.sBackgroundColor;
        const borderColor = data.sBorderColor || dataset._pointColorDefaults.sBorderColor;
        dataset._hasPointColorOverrides ||= Boolean(data.sBackgroundColor || data.sBorderColor);
        dataset._pointColorsMatch = dataset._pointColorsMatch && backgroundColor === borderColor;
        if (['bar', 'pie', 'doughnut', 'polarArea'].includes(type)) {
            dataset.borderWidth = dataset._hasPointColorOverrides && dataset._pointColorsMatch ? 0 : dataset._defaultBorderWidth;
        }

        this.currentChart.update();
    }

    changeDataPoint(datasetIndex, valueIndex, newValue) {
        const point = this.chartData[datasetIndex].data[valueIndex];
        if (point !== null && typeof point === 'object') {
            point.y = newValue;
        } else {
            this.chartData[datasetIndex].data[valueIndex] = newValue;
        }
        this.currentChart.update();
    }

    removeDataset(datasetIndex) {
        super.removeDataset(datasetIndex);
        this.currentChart.data.datasets.splice(datasetIndex, 1);
        this.currentChart.update();
    }

}

//Register at chartcontrol
window.addEventListener('load', function (event) {
    df.ChartControl.prototype.registerRenderer("Chartjs", ChartjsChart, false);
})
