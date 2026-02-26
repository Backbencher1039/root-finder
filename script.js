function solve() {
  let f_str = document.getElementById("functionInput").value;
  let method = document.getElementById("methodSelect").value;
  let a = parseFloat(document.getElementById("valueA").value);
  let b = parseFloat(document.getElementById("valueB").value);
  let tol = parseFloat(document.getElementById("tolerance").value);
  let maxIter = parseInt(document.getElementById("maxIter").value);

  let tableBody = document.querySelector("#iterationTable tbody");
  tableBody.innerHTML = "";

  let f = new Function("x", "return " + f_str);

  let iterations = [];
  let root;

  try {
    if (method === "bisection") {
      if (f(a) * f(b) > 0) throw "Invalid interval";

      for (let i = 0; i < maxIter; i++) {
        let c = (a + b) / 2;
        iterations.push({ iter: i + 1, x: c, fx: f(c) });

        if (Math.abs(f(c)) < tol) {
          root = c;
          break;
        }

        if (f(a) * f(c) < 0) b = c;
        else a = c;

        root = c;
      }
    } else if (method === "newton") {
      let x0 = a;
      let h = 0.00001;

      for (let i = 0; i < maxIter; i++) {
        let df = (f(x0 + h) - f(x0 - h)) / (2 * h);
        if (df === 0) throw "Derivative zero";

        let x1 = x0 - f(x0) / df;

        iterations.push({ iter: i + 1, x: x1, fx: f(x1) });

        if (Math.abs(x1 - x0) < tol) {
          root = x1;
          break;
        }

        x0 = x1;
        root = x1;
      }
    }

    displayTable(iterations);
    plotGraph(f, root);

    document.getElementById("resultBox").innerHTML =
      "<strong>Root ≈ </strong>" + root;
  } catch (error) {
    document.getElementById("resultBox").innerHTML =
      "<strong>Error:</strong> " + error;
  }
}
let result;

try {
  if (method === "bisection") result = bisection(f_str, a, b, tol, maxIter);
  else if (method === "falsePosition")
    result = falsePosition(f_str, a, b, tol, maxIter);
  else if (method === "newton") result = newtonRaphson(f_str, a, tol, maxIter);
  else if (method === "secant") result = secant(f_str, a, b, tol, maxIter);
  else if (method === "fixed") result = fixedPoint(f_str, a, tol, maxIter);

  document.getElementById("resultBox").innerHTML =
    "<strong>Root ≈ </strong>" + result;
} catch (error) {
  document.getElementById("resultBox").innerHTML =
    "<strong>Error:</strong> " + error;
}

/* ---------------- METHODS ---------------- */

function bisection(f_str, a, b, tol, maxIter) {
  let f = new Function("x", "return " + f_str);

  if (f(a) * f(b) > 0) throw "Invalid interval.";

  let c;

  for (let i = 0; i < maxIter; i++) {
    c = (a + b) / 2;

    if (Math.abs(f(c)) < tol) return c;

    if (f(a) * f(c) < 0) b = c;
    else a = c;
  }

  return c;
}

function falsePosition(f_str, a, b, tol, maxIter) {
  let f = new Function("x", "return " + f_str);

  if (f(a) * f(b) > 0) throw "Invalid interval.";

  let c;

  for (let i = 0; i < maxIter; i++) {
    c = (a * f(b) - b * f(a)) / (f(b) - f(a));

    if (Math.abs(f(c)) < tol) return c;

    if (f(a) * f(c) < 0) b = c;
    else a = c;
  }

  return c;
}

function newtonRaphson(f_str, x0, tol, maxIter) {
  let f = new Function("x", "return " + f_str);

  function derivative(x) {
    let h = 0.00001;
    return (f(x + h) - f(x - h)) / (2 * h);
  }

  let x1;

  for (let i = 0; i < maxIter; i++) {
    let df = derivative(x0);

    if (df === 0) throw "Derivative became zero.";

    x1 = x0 - f(x0) / df;

    if (Math.abs(x1 - x0) < tol) return x1;

    x0 = x1;
  }

  return x1;
}

function secant(f_str, x0, x1, tol, maxIter) {
  let f = new Function("x", "return " + f_str);

  let x2;

  for (let i = 0; i < maxIter; i++) {
    let denominator = f(x1) - f(x0);

    if (denominator === 0) throw "Division by zero.";

    x2 = x1 - (f(x1) * (x1 - x0)) / denominator;

    if (Math.abs(x2 - x1) < tol) return x2;

    x0 = x1;
    x1 = x2;
  }

  return x2;
}

function fixedPoint(g_str, x0, tol, maxIter) {
  let g = new Function("x", "return " + g_str);

  let x1;

  for (let i = 0; i < maxIter; i++) {
    x1 = g(x0);

    if (Math.abs(x1 - x0) < tol) return x1;

    x0 = x1;
  }

  return x1;
}
function displayTable(iterations) {
  let tableBody = document.querySelector("#iterationTable tbody");

  iterations.forEach((row) => {
    let tr = document.createElement("tr");

    tr.innerHTML = `
            <td>${row.iter}</td>
            <td>${row.x.toFixed(6)}</td>
            <td>${row.fx.toFixed(6)}</td>
        `;

    tableBody.appendChild(tr);
  });
}
let chart;

function plotGraph(f, root) {
  let ctx = document.getElementById("functionChart").getContext("2d");

  let xValues = [];
  let yValues = [];

  for (let x = root - 10; x <= root + 10; x += 0.5) {
    xValues.push(x);
    yValues.push(f(x));
  }

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          label: "f(x)",
          data: yValues,
          borderColor: "cyan",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "x" } },
        y: { title: { display: true, text: "f(x)" } },
      },
    },
  });
}
