function eval() {
    // Do not use eval!!!
    return;
}

function Stack() {
    this.items = []
}
Stack.prototype = {
    add(el) {
        this.items.push(el)
    },
    peek() {
        return this.items[this.items.length - 1]
    },
    pop() {
        return this.items.pop()
    }
}

const expressions = {
    "+": function (a, b) {
        return a + b
    },
    "-": function (a, b) {
        return a - b
    },
    "*": function (a, b) {
        return a * b
    },
    "/": function (a, b) {
        if (b == 0) {
            throw "TypeError: Division by zero."
        }
        return a / b
    },
}

const expressionPriority = {
    "+": 0,
    "-": 0,
    "*": 1,
    "/": 1,
}

function getCloseBracketIndex(expr, startIndex) {
    let openBrackets = 0
    for (let i = startIndex; i < expr.length; i++) {
        if (expr[i] == "(") {
            openBrackets++
        }
        if (expr[i] == ")") {
            if (openBrackets == 0) {
                return i
            } else {
                openBrackets--
            }
        }
    }
}

function expressionCalculator(expr) {
    const openBrackets = expr.match(/\(/g) || []
    const closedBrackets = expr.match(/\)/g) || []
    if (openBrackets.length != closedBrackets.length) {
        throw "ExpressionError: Brackets must be paired"
    }
    const normalized = expr.replace(/\s+/g, "")
    let chunk = ""
    const args_stack = new Stack()
    const signs_stack = new Stack()
    let priority = 0, a, b
    for (let i = 0; i < normalized.length;) {
        if (normalized[i] in expressions) {
            const sign = normalized[i]
            const signPriority = expressionPriority[sign]

            if (args_stack.peek() && (priority > 0)) {
                a = args_stack.pop()
                b = +chunk
                args_stack.add(
                    expressions[signs_stack.pop()](a, b)
                )
            } else {
                args_stack.add(+chunk)
            }
            signs_stack.add(sign)
            priority = signPriority
            chunk = ""
            i++
        } else {
            if(normalized[i] == "(") {
                const closeBracketIndex = getCloseBracketIndex(normalized, i + 1)
                const expr_in_brackets = normalized.slice(i + 1, closeBracketIndex)
                chunk = expressionCalculator(expr_in_brackets)
                i = closeBracketIndex + 1
                if (i > normalized.length - 1) {
                    if (priority > 0) {
                        a = args_stack.pop()
                        b = +chunk
                        args_stack.add(
                            expressions[signs_stack.pop()](a, b)
                        )
                    } else {
                        args_stack.add(chunk)
                    }
                }
            } else {
                chunk += normalized[i]
                i++
                if (i > normalized.length - 1) {
                    const signPriority = priority
                    priority = expressionPriority[signs_stack.peek()]
                    if (signPriority > 0) {
                        a = args_stack.pop()
                        b = +chunk
                        args_stack.add(
                            expressions[signs_stack.pop()](a, b)
                        )
                    } else {
                        args_stack.add(+chunk)
                    }
                }
            }
        }
    }
    return args_stack.items.reduce((acc, cur) => {
        return expressions[signs_stack.items.shift()](acc, cur)
    })
}

module.exports = {
    expressionCalculator
}