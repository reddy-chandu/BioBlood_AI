function previewFile() {
    const file = document.querySelector('input[type=file]').files[0];
    const allowedExtensions = ['.png', '.jpeg', '.jpg', '.bmp'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(`.${fileExtension}`)) {
        alert('Supported formats: bmp, jpg, jpeg, png only');
        file.value = '';
        document.querySelector("form").reset();
        return;
    }

    const preview = document.querySelector('#preview');
    const reader = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
        preview.style.display = "block";
        document.getElementsByClassName('preview-container')[0].style.borderColor = "#218380";
    }

    reader.readAsDataURL(file);
}

function submitForm() {
    const form = document.querySelector('form');
    const confidenceBar = document.querySelector('.confidence-bar');
    const confidenceText = document.querySelector('.confidence-text');

    if (!form.checkValidity()) {
        return;
    }

    const formData = new FormData(form);
    formData.append('file', document.querySelector('input[type=file]').files[0]);

    fetch('/predict', {
        method: 'POST',
        body: formData
    }).then(response => response.json()).then(data => {
        data.confidence = (data.confidence * 100).toFixed(2);
        if (data.confidence <= 50) {
            confidenceBar.style.stroke = "#ff8012";
        } else {
            confidenceBar.style.stroke = "#218380";
        }
        document.getElementsByClassName('result-container')[0].style.display = "block";
        document.querySelector('#result').textContent = data.prediction + "ve";
        confidenceText.textContent = data.confidence + "%";
        document.getElementById("preview").src = "../static/img/sample.BMP";
        document.getElementsByClassName('preview-container')[0].style.borderColor = "grey";
        form.reset();
        setTimeout(() => {
            confidenceBar.style.strokeDashoffset = `${(100 - data.confidence) * 3.6}`;
            document.getElementsByClassName('result-container')[0].scrollIntoView({ behavior: 'smooth' });
        }, 100)
    });
}