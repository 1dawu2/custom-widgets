var getScriptPromisify = (src) => {
    return new Promise(resolve => {
        $.getScript(src, resolve)
    })
}

(function () {
    let template = document.createElement("template");
    template.innerHTML = `
    <style>
    #root {
      background-color: #100c2a;
    }
    #placeholder {
      padding-top: 1em;
      text-align: center;
      font-size: 1.5em;
      color: white;
    }
    </style>
    <div id="root" style="width: 100%; height: 100%;">
        <div id="placeholder">Time-Series Animation Chart</div>
    </div>
 `;

    class ColoredBox extends HTMLElement {
        constructor() {
            super();
            var _tableName;

            this._shadowRoot = this.attachShadow({ mode: 'open' })
            this._shadowRoot.appendChild(template.content.cloneNode(true))

            this._root = this._shadowRoot.getElementById('root')

            this._props = {}
        }

        get tableName() {
            return this._tableName;
        }
        set tableName(tableName) {
            console.log("setTitle:" + tableName);
            this._tableName = tableName;
        }

        _button = undefined;
        setButtonText1(button, text) {
            button.setText(text); // (2) OK
            _button = button;
            setTimeout(() => {
                this._button.setText(text); // (3) WILL NOT WORK!
            });
        }

        handleClick() {
            this._button.setText("Hello!"); // (4) WILL NOT WORK!
            this._dataSource;
            console.log(this._dataSource);
        }


        async render(resultSet) {
            await getScriptPromisify('https://cdn.bootcdn.net/ajax/libs/echarts/5.0.0/echarts.min.js')

            this._placeholder = this._root.querySelector('#placeholder')
            if (this._placeholder) {
                this._root.removeChild(this._placeholder)
                this._placeholder = null
            }
            if (this._myChart) {
                echarts.dispose(this._myChart)
            }
            var myChart = this._myChart = echarts.init(this._root, 'shine')


            const MEASURE_DIMENSION = 'Account'
            const dates = []
            const values = []
            console.log(resultSet);
            resultSet.forEach(dp => {
                const { rawValue, description } = dp[MEASURE_DIMENSION]
                const date = dp.Date.description

                if (dates.indexOf(date) === -1) {
                    dates.push(date);
                }

                if (description === 'Volume') {
                    values.push(rawValue);
                }

            })

            const data = {
                dates,
                values
            }

            console.log(data);

            myChart.setOption({
                title: {
                    text: 'My first eChart'
                },
                tooltip: {},
                xAxis: {
                    data: data.dates
                },
                yAxis: {
                    //data: data.products
                },
                series: [{
                    name: 'Volume',
                    type: this.chartType,
                    data: data.values
                }]
            });
        }

        onCustomWidgetResize(width, height) {
            this.render()
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            this._props = { ...this._props, ...changedProperties };
        }
        onCustomWidgetAfterUpdate(changedProperties) {
            if ("color" in changedProperties) {
                this.style["background-color"] = changedProperties["color"];
            }
            if ("opacity" in changedProperties) {
                this.style["opacity"] = changedProperties["opacity"];
            }
            if ("chartType" in changedProperties) {
                this.chartType = changedProperties["chartType"];
                console.log(changedProperties["chartType"]);
            }
        }
    }
    customElements.define("com-box-htg-main", ColoredBox);
})();