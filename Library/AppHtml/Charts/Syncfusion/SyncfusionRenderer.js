import { ChartBase, HoverBehavior, TooltipLocation } from "../ChartBase/ChartBase.js";
const availableChartTypes = ['line', 'bar', 'pie', 'doughnut', 'column', 'radar', 'stepline', 'stackingline', 'stackingline100', 'spline',
    'area', 'stackingarea', 'stackingarea100', 'stackingsteparea', 'steparea', 'splinearea', 'stackingcolumn', 'stackingcolumn100', 'stackingbar',
    'stackingbar100', 'scatter', 'bubble', 'polar', 'pareto'];

class SyncfusionChart extends ChartBase {

    drawChart() {
        super.drawChart();

        const that = this;
        const groupedHover = this.hoverBehavior === HoverBehavior.hbIndex && !['pie', 'doughnut'].includes(this.chartType);

        if (!availableChartTypes.includes(this.chartType)) throw new df.Error(999, 'Syncfusion does not support this chart type!');

        try {

            //Create the chart based on what type of chart it is
            switch (this.chartType) {
                case "pie":
                case "doughnut":
                    this.currentChart = new ej.charts.AccumulationChart();
                    break;
                default:
                    this.currentChart = new ej.charts.Chart();
                    this.currentChart.primaryXAxis.valueType = 'Category';
                    this.currentChart.primaryXAxis.visible = this.showXAxis;
                    if (this.xAxisLabelMinRotation === this.xAxisLabelMaxRotation) {
                        this.currentChart.primaryXAxis.labelRotation = this.xAxisLabelMinRotation;
                    } else if (this.xAxisLabelMaxRotation >= 90) {
                        this.currentChart.primaryXAxis.labelIntersectAction = 'Rotate90';
                    } else if (this.xAxisLabelMaxRotation >= 45) {
                        this.currentChart.primaryXAxis.labelIntersectAction = 'Rotate45';
                    } else {
                        this.currentChart.primaryXAxis.labelRotation = this.xAxisLabelMinRotation;
                    }
                    this.currentChart.primaryYAxis.title = this.yAxisLabel;
                    this.currentChart.primaryYAxis.visible = this.showYAxis;
                    this.currentChart.chartArea.border.width = 0;
                    this.currentChart.chartArea.background = this.backgroundColor;
                    //Zooming options for the chart
                    this.currentChart.zoomSettings.enableMouseWheelZooming = this.zoomable;
                    this.currentChart.zoomSettings.enablePinchZooming = this.zoomable;
                    this.currentChart.zoomSettings.enableSelectionZooming = this.zoomable;
                    break;
            }
        } catch (error) {
            throw new df.Error(999, error);
        }

        //Populate the chart with info
        this.currentChart.series = this.chartData;
        this.currentChart.highlightMode = groupedHover ? 'Cluster' : 'Point';
        const hoverColors = this.chartData.flatMap(series => series.dataSource.map(point => point.hoverColor)).filter(Boolean);
        if (hoverColors.length && hoverColors.every(color => color === hoverColors[0])) {
            this.currentChart.highlightColor = hoverColors[0];
        }
        this.currentChart.title = this.title;
        this.currentChart.subTitle = this.subtitle;
        this.currentChart.legendSettings.visible = this.legendEnabled;
        this.currentChart.legendSettings.position = this.legendAlignment.charAt(0).toUpperCase() + this.legendAlignment.slice(1);
        this.currentChart.tooltip.enable = true;
        this.currentChart.tooltip.shared = groupedHover;
        this.currentChart.tooltip.followPointer = this.tooltipLocation === TooltipLocation.tlNearest;
        this.currentChart.pointRender = function (args) {
            const point = args.series.dataSource[args.point.index];
            const borderColor = point?.borderColor;
            if (borderColor) {
                args.border.color = borderColor;
            }
            args.border.width = point?.borderWidth ?? args.border.width;
        }
        this.currentChart.tooltipRender = function (args) {
            const customTooltip = that.chartData[args.data.seriesIndex].dataSource[args.data.pointIndex].tooltip;
            if (customTooltip != '') {
                args.text = args.point.x + ': ' + args.point.y + '<br>' + that.chartData[args.data.seriesIndex].dataSource[args.data.pointIndex].tooltip;
            }
        }

        //Handle the pointClick event in syncfusion, in case that the charttype is pie or doughnut read different values
        this.currentChart.pointClick = (event) => {

            if (this.chartType !== "pie" && "doughnut") {
                this.onClick(event.point.x, event.point.y, event.point.tooltip ?? '', event.point.index, event.point.series.name);
            } else {
                this.onClick(event.point.x, event.point.y, event.point.tooltip ?? '', event.point.index, event.series.properties.name);
            }

        }

        this.currentChart.appendTo(this.chartLocation);
        //Disable the animations for the series that are currently rendered. This way they wont be redrawn when the chart is updated.
        //This allows for nice animations to only play for new series that are being inserted
        this.currentChart.series.forEach(series => {
            series.animation.enable = false;
        });

    };

    formatData(data) {
        //Modify the data for the specific library and charttype
        let newData, type, innerRadius;
        const pointDefaults = {
            color: data.sPointBackgroundColor || data.sSeriesColor || undefined,
            hoverColor: data.sPointHoverBackgroundColor || undefined,
            borderColor: data.sPointBorderColor || data.sSeriesColor || undefined,
            hoverBorderColor: data.sPointHoverBorderColor || undefined,
            borderWidth: data.nPointBorderWidth || 1
        };

        //Get the type and capitalize the first letter because syncfusion is case sensitive
        type = data.sType ? data.sType : this.chartType;
        if (data.nTension && type === 'line') type = 'spline';
        type = type.charAt(0).toUpperCase() + type.slice(1);

        //Check if the type is a doughnut chart, if it is set the inner radius to 40%
        if (type === 'Doughnut') {
            innerRadius = '40%';
            type = undefined;
        }

        switch (this.chartType) {
            default:
                newData = {
                    type: type,
                    name: data.sLabel,
                    fill: data.sSeriesColor,
                    width: data.nLineThickness? data.nLineThickness : 2,
                    marker: {
                        visible: true,
                        width: (data.nPointRadius || 3) * 2,
                        height: (data.nPointRadius || 3) * 2,
                        fill: pointDefaults.color,
                        border: {
                            color: pointDefaults.borderColor,
                            width: pointDefaults.borderWidth
                        }
                    },
                    border: {
                        color: pointDefaults.borderColor,
                        width: pointDefaults.borderWidth
                    },
                    xName: 'label',
                    yName: 'data',
                    pointColorMapping: 'color',
                    dataSource: [],
                    innerRadius: innerRadius,
                    animation: {
                        enable: true
                    },
                    dataLabel: {
                        visible: true, position: 'Outside',
                        connectorStyle: { length: '10%' }, name: 'label',
                        font: { size: '14px' }
                    },
                }
                for (let index = 0; index < this.xAxisLabels.length; index++) {
                    newData.dataSource[index] = {
                        label: this.xAxisLabels[index],
                        data: data.dataPoints[index]?.y ?? 0,
                        tooltip: data.dataPoints[index]?.sTooltip,
                        color: data.dataPoints[index]?.sBackgroundColor || pointDefaults.color,
                        hoverColor: data.dataPoints[index]?.sHoverBackgroundColor || pointDefaults.hoverColor,
                        borderColor: data.dataPoints[index]?.sBorderColor || pointDefaults.borderColor,
                        hoverBorderColor: data.dataPoints[index]?.sHoverBorderColor || pointDefaults.hoverBorderColor,
                        borderWidth: pointDefaults.borderWidth
                    }
                }
                break;
        }

        newData._pointDefaults = pointDefaults;
        return newData;
    }

    addNewSeries(data) {
        //Call super to parse the data
        data = super.addNewSeries(data);

        this.currentChart.addSeries([data]);

        //Disable the animation of the series that was just added, this way it isnt fully redrawn when an item is added to the chart again
        this.currentChart.series[this.currentChart.series.length - 1].animation.enable = false;

    }

    addNewDataPoint(datasetIndex, data) {
        const defaults = this.chartData[datasetIndex]._pointDefaults;
        //Create a new object to put the data information inside
        const dataObject = {
            label: this.xAxisLabels[this.xAxisLabels.length - 1],
            data: data.y,
            tooltip: data.sTooltip,
            color: data.sBackgroundColor || defaults.color,
            hoverColor: data.sHoverBackgroundColor || defaults.hoverColor,
            borderColor: data.sBorderColor || defaults.borderColor,
            hoverBorderColor: data.sHoverBorderColor || defaults.hoverBorderColor,
            borderWidth: defaults.borderWidth
        }

        //Push the newly created dataObject to the dataset
        this.currentChart.series[datasetIndex].dataSource.push(dataObject);

        this.currentChart.refresh();
    }

    changeDataPoint(datasetIndex, valueIndex, newValue) {
        //Get the old value and calculate the difference
        this.currentChart.series[datasetIndex].dataSource[valueIndex].data = newValue;
        this.currentChart.refresh();
    }

    removeDataset(datasetIndex) {
        //Remove the series from the chart and refresh
        this.currentChart.removeSeries(datasetIndex);
        this.currentChart.refresh();
    }
}

//Register at chartcontrol
window.addEventListener('load', function (event) {
    df.ChartControl.prototype.registerRenderer(SyncfusionChart, true);
})