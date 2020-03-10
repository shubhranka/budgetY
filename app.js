var budgetControl = (function() {
    var Expenses = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expenses.prototype.calculatePercentage = function() {

        if (data.total.inc > 0) {
            this.percentage = ((this.value / data.total.inc) * 100);
        } else
            this.percentage = -1;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function() {
        var sum = 0;
        data.allItems.exp.forEach(function(e) {
            sum += e.value;
        });
        data.total.exp = sum;

        sum = 0;
        data.allItems.inc.forEach(function(e) {
            sum += e.value;
        });
        data.total.inc = sum;

    }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, description, value) {
            var newItem;

            if (data.allItems[type].length > 0)
                var ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;

            if (type === "exp")
                newItem = new Expenses(ID, description, value);
            else
                newItem = new Income(ID, description, value);
            data.allItems[type].push(newItem);
            return newItem;
        },

        calculateTotalBudget: function() {
            // Calcualate the total
            calculateTotal();

            // Calculate the budget
            data.budget = data.total.inc - data.total.exp;

            // Calculate the percentage
            if (data.total.inc === 0)
                data.percentage = -1;
            else
                data.percentage = (data.total.exp / data.total.inc * 100);
        },

        getBudget: function() {
            return {
                budget: data.budget,
                percentage: data.percentage,
                income: data.total.inc,
                expense: data.total.exp
            }
        },

        calculatePercentage: function() {
            data.allItems.exp.forEach(function(curr) {
                curr.calculatePercentage();
            });
        },

        getPercentages: function() {
            var prc = data.allItems.exp.map(function(curr) {
                return curr.percentage;
            });

            return prc;
        },

        deleteItem: function(type, id) {
            var ids = data.allItems[type].map(function(curr) {
                return curr.id;
            });
            var idx = ids.indexOf(id);
            if (idx !== -1) {
                data.allItems[type].splice(idx, 1);
            }
        }
    }

})();

var UIControl = (function() {

    var DOMStrings = {
        inputbtn: ".add__btn",
        inputDescription: ".add__description",
        inputType: ".add__type",
        inputValue: ".add__value",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLablel: ".budget__value",
        budgetIncomeLabel: ".budget__income--value",
        budgetExpenseLabel: ".budget__expenses--value",
        budgetExpensePercentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expPercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month",
    };

    var formatNumber = function(num) {
        if (num === -1)
            return "---";
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");
        int = numSplit[0];
        dec = numSplit[1];
        for (var i = int.length - 3; i > 0; i -= 3) {
            int = int.substring(0, i) + ',' + int.substring(i);
        }

        return int + '.' + dec;
    };

    var fieldsForEach = function(fs, callback) {
        for (var i = 0; i < fs.length; i++)
            callback(fs[i], i);
    };

    return {
        getInputValues: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
                description: document.querySelector(DOMStrings.inputDescription).value
            };
        },

        getDOMStrings: function() {
            return DOMStrings;
        },

        addListItem: function(obj, type) {
            var html, element;

            if (type == "exp") {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix">     <div class="item__value">- %value%</div>     <div class="item__percentage">21%</div>     <div class="item__delete">         <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>     </div> </div></div>'
            } else {
                html = '<div class="item clearfix" id="inc-%id%">    <div class="item__description">%description%</div>    <div class="right clearfix">        <div class="item__value">+ %value%</div>        <div class="item__delete">            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>        </div>    </div></div>'
                element = DOMStrings.incomeContainer;
            }
            html = html.replace("%id%", obj.id);
            html = html.replace("%description%", obj.description);
            html = html.replace("%value%", formatNumber(obj.value));
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(c) {
                c.value = "";
            });

            fieldsArr[0].focus();
        },

        budgetDisplay: function(obj) {

            // Get the fields
            document.querySelector(DOMStrings.budgetLablel).textContent = '+ ' + formatNumber(obj.budget);
            document.querySelector(DOMStrings.budgetExpenseLabel).textContent = '- ' + formatNumber(obj.expense);
            if (obj.percentage > 0)
                document.querySelector(DOMStrings.budgetExpensePercentageLabel).textContent = formatNumber(obj.percentage) + ' %';
            else
                document.querySelector(DOMStrings.budgetExpensePercentageLabel).textContent = '-' + ' %';
            document.querySelector(DOMStrings.budgetIncomeLabel).textContent = '+ ' + formatNumber(obj.income);

            // Update the Fields
        },

        deleteListItem: function(itemID) {
            var el = document.getElementById(itemID);
            el.parentNode.removeChild(el);
        },

        displayDate() {
            var now = new Date();

            document.querySelector(DOMStrings.dateLabel).textContent = now.getMonth() + " / " + now.getFullYear() + " ";
        },

        percentageDisplay(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expPercentageLabel);

            fieldsForEach(fields, function(curr, index) {

                if (percentages[index] > 0) {
                    curr.textContent = formatNumber(percentages[index]) + ' %';
                } else {
                    curr.textContent = "---";
                }
            })
        },

        changeFocus() {
            var fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue + ',' + DOMStrings.inputType);
            fieldsForEach(fields, function(curr, ind) {
                curr.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputbtn).classList.toggle('red');
        }
    }

})();

var control = (function(budgetCTRL, UIctrl) {

    function updatePercentages() {

        // 1. Calculate Percentages
        budgetCTRL.calculatePercentage();

        // 2. Get the percentage Array
        var prc = budgetCTRL.getPercentages();
        // Display at the UI

        UIctrl.percentageDisplay(prc);
    };

    function updateBudget() {
        // 1. Calculate the budget.
        budgetCTRL.calculateTotalBudget();
        // 2. Return the Budget
        var totalData = budgetCTRL.getBudget()
            // 5. Display the budget on UI.
        UIControl.budgetDisplay(totalData);
    };
    var setupEventListeners = function() {
        var DOMS = UIControl.getDOMStrings();
        UIControl.displayDate();
        document.querySelector(DOMS.inputbtn).addEventListener('click', getInputData);

        document.querySelector(DOMS.inputValue).addEventListener('keypress', function(e) {

            if (e.key === 13 || e.which === 13) {
                getInputData();
            }
        });

        document.querySelector(DOMS.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOMS.inputType).addEventListener('change', UIctrl.changeFocus);
    };
    var getInputData = function() {

        // 1. Get the field input data.
        var inputv = UIctrl.getInputValues();

        if (inputv.value > 0 && inputv.description !== "") {
            // 2. Add the item to the budget control.
            var newItem = budgetCTRL.addItem(inputv.type, inputv.description, inputv.value);

            // 3. Add item to UI.
            UIctrl.addListItem(newItem, inputv.type);

            // 4. Clear Fields
            UIctrl.clearFields();

            // 5. Update Budget
            updateBudget();

            // 6. Update Percentage
            updatePercentages();

        }



    };

    var ctrlDeleteItem = function(e) {
        var itemID, splitID, type, ID;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }
        // 1. delete from Budget
        budgetCTRL.deleteItem(type, ID);

        // Delete UI list
        UIctrl.deleteListItem(itemID);

        // Update Budget
        updateBudget();

        // Update Percentage
        updatePercentages();
    };
    return {
        init: setupEventListeners
    };

})(budgetControl, UIControl);

control.init();