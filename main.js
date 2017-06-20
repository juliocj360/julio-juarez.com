var TxtType = function(el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = '';
  this.tick();
  this.isDeleting = false;
};

TxtType.prototype.tick = function() {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  }
  else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

  var that = this;
  var delta = 150 - Math.random() * 100;

  if (this.isDeleting) { delta /= 3; }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  }
  else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function() {
    that.tick();
  }, delta);
}

window.onload = function() {
  var elements = document.getElementsByClassName('typewrite');
  for (var i=0; i<elements.length; i++) {
    var toRotate = elements[i].getAttribute('data-type');
    var period = elements[i].getAttribute('data-period');
    if (toRotate) {
      new TxtType(elements[i], JSON.parse(toRotate), period);
    }
  }
  var css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
  document.body.appendChild(css);
}

var LPAWS = {};

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:feb90a7a-d5db-4ed9-b757-5b36e829cfc4',
});

LPAWS.sendToTopic = function(params) {
  let secondMsg = false
  const button = document.getElementById('contact-button')
  if (button.textContent === 'Another Message?') {
    secondMsg = true
  }
  button.textContent = ""
  const spinner = document.createElement('i')
  spinner.className = 'fa fa-spinner fa-spin fa-3x fa-fw'
  spinner.style.fontSize = '1em'
  button.appendChild(spinner)

  var sns = new AWS.SNS()
  sns.publish(params, function(err, data) {
    if (err) {
      button.textContent = "Error, try again."
      button.style.backgroundColor = "#e00719"
      console.log(err, err.stack)
    }
    else {
      button.removeChild(button.firstChild)
      button.textContent = secondMsg ? "2nd message sent!" : "Message Sent!"
    }
  })
}

const formSubmit = () => {
  const name = document.querySelector('#nameInput')
  const email = document.querySelector('#emailInput')
  const text = document.querySelector('#textInput')
  const button = document.getElementById('contact-button')

  var params = {
      Message: `Name: ${name.value}, Email: ${email.value}, Text: ${text.value}`,
      Subject: 'Browser SNS publish - contact form',
      TopicArn: 'arn:aws:sns:us-east-1:900566148122:website-contact-form'
  };
  if (name.value.length === 0) {
    name.style.borderColor = "red"
  }
  else if (email.value.length === 0) {
    email.style.borderColor = "red"
  }
  else if (text.value.length === 0) {
    text.style.borderColor = "red"
  }
  else if (button.textContent === 'Message Sent!') {
    button.textContent = "Another Message?"
  }
  else if (button.textContent === '2nd message sent!' || button.textContent === "Sorry, I'm gonna have to cut you off. Try my email instead.") {
    button.textContent = "Sorry, I'm gonna have to cut you off. Try my email instead."
  }
  else {
    name.style.borderColor = ''
    email.style.borderColor = ''
    text.style.borderColor = ''
    LPAWS.sendToTopic(params)
  }
}
