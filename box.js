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
            var myChart = this._myChart = echarts.init(this._root, 'dark')


            const MEASURE_DIMENSION = 'Account'
            const dates = []
            const products = []
            const series = []
            console.log(resultSet);
            resultSet.forEach(dp => {
                const { rawValue, description } = dp[MEASURE_DIMENSION]
                const date = Number(dp.Date.description)
                const product = dp.Product.description

                if (dates.indexOf(date) === -1) {
                    dates.push(date);
                }

                if (products.indexOf(product) === -1) {
                    products.push(product);
                }

                const iT = dates.indexOf(date)
                series[iT] = series[iT] || []
                const iP = products.indexOf(product)
                series[iT][iP] = series[iT][iP] || []

                let iV
                if (description === 'Volume') {
                    iV = 0
                }
                series[iT][iP][iV] = rawValue
                series[iT][iP][1] = product
                series[iT][iP][2] = date

                //console.log(series);

            })

            const data = {
                products,
                series,
                dates
            }

            var itemStyle = {
                opacity: 0.8,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }

            var sizeFunction = function (x) {
                var y = Math.sqrt(x / 5e8) + 0.1
                return y * 80
            }

            var schema = [
                { name: 'Volume', index: 0, text: 'Volume', unit: 'PCS' },
                { name: 'Product', index: 1, text: 'Product', unit: '' },
                { name: 'Date', index: 2, text: 'Date', unit: 'Year' }
            ]

            const option = {
                baseOption: {
                    xAxis: {
                        type: 'category',
                        axisLabel: {
                            formatter: '{value}'
                        }

                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: {
                        type: 'line',
                        data: data.series[0]
                    }
                },
                options: []
            }

            for (var n = 0; n < data.dates.length; n++) {
                //option.baseOption.timeline.data.push(data.dates[n])
                option.options.push({
                    /*
                    title: {
                        show: true,
                        text: data.dates[n] + ''
                    },
                    */
                    series: {
                        //name: data.dates[n],
                        type: 'line',
                        //itemStyle: itemStyle,
                        data: data.series[n],
                        /*
                        symbolSize: function (val) {
                            return sizeFunction(val[2])
                        }
                        */
                    }
                })
            }

            myChart.setOption(option)

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
        }
    }
    customElements.define("com-box-htg-main", ColoredBox);
})();