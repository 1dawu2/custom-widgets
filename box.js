(function () {
    let template = document.createElement("template");
    template.innerHTML = `
    <style>
    :host {
    border-radius: 25px;
    border-width: 4px;
    border-color: black;
    border-style: solid;
    display: block;
    } 
    </style>
 `;
    class ColoredBox extends HTMLElement {
        constructor() {
            super();
            var _dataSource;
            var _tableName;
            let shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.appendChild(template.content.cloneNode(true));
            this.addEventListener("click", event => {
                var event = new Event("onClick");
                this.dispatchEvent(event);
            });
            this._props = {};
        }

        get tableName() {
            return this._tableName;
        }
        set tableName(tableName) {
        	console.log("setTitle:" + tableName);
            this._tableName = tableName;
        }



		async retrieveSource(source) {
			this._dataSource = source;			
            console.log(source);
			let resultSet = await source.getResultSet();
            console.log(resultSet);
            let value = result ? parseFloat(result["@MeasureDimension"].rawValue) : null;
            console.log(value);	
            console.log("Hallo World");
            alert("Hello! I am an alert box!!");
			
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
