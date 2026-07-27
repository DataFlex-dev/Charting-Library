export const HoverBehavior = Object.freeze({ hbNearest: 0, hbIndex: 1 });
export const TooltipLocation = Object.freeze({ tlNearest: 0, tlAverage: 1 });

export class ChartBase {

    constructor(control) {
        this.syncFromControl(control);
        this.currentChart = null;

        this.drawChart();
    }

    syncFromControl(control) {
        Object.assign(this, {
            control,
            chartLocation: control._eChart,
            title: control.psTitle,
            subtitle: control.psSubtitle,
            backgroundColor: control.psChartBackgroundColor,
            chartData: [...control.chartData],
            chartType: control.psChartType,
            xAxisLabels: control._aXAxisLabels,
            xAxisLabelMinRotation: control.piXAxisLabelMinRotation,
            xAxisLabelMaxRotation: control.piXAxisLabelMaxRotation,
            yAxisLabel: control.psYAxisLabel,
            showXAxis: control.pbShowXAxis,
            showYAxis: control.pbShowYAxis,
            legendAlignment: control.psLegendAlignment,
            legendEnabled: control.pbLegendEnabled,
            zoomable: control.pbZoomable,
            hoverBehavior: control.peHoverBehavior,
            tooltipLocation: control.peTooltipLocation
        });
    }

    //Handles the drawing of the chart
    drawChart() {

        //Parse the data
        for (let index = 0; index < this.chartData.length; index++) {
            this.chartData[index] = this.formatData(this.chartData[index]);
        }

        this.clearPreviousChart();
    }

    //Define a empty method that will be implemented in the subclasses
    formatData(data) {

    }

    //Clears the previous chart
    clearPreviousChart() {
        //If the current chart is null there is no reason to call a destruction
        if (this.currentChart == null) return;

        //Destroy the chart so that we do not keep references to the old chart
        this.currentChart.destroy();
    }

    //Allows for new series to be added to the chart
    addNewSeries(data) {
        data = this.formatData(data);
        this.chartData.push(data);

        return data;
    }

    //Implement in subclasses
    addNewDataPoint(datasetIndex, data) {
    }

    //Implement in subclasses
    changeDataPoint(datasetIndex, valueIndex, newValue) {
    }

    removeDataset(datasetIndex) {
        this.chartData.splice(datasetIndex, 1);
    }

    //Handles the onClick event
    onClick(dataX, dataY, tooltip, dataIndex, datasetName) {
        this.control.sendOnClick(dataX, dataY, tooltip, dataIndex, datasetName);
    }

}
