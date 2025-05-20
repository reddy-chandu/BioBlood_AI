from flask import Flask, request, render_template
import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np
from PIL import Image
import io

app = Flask(__name__)

# load the model
model = tf.keras.models.load_model('./model/blood_group_prediction.h5')

# preprocess the image
def preprocess_image(file):
    img = Image.open(file)
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='BMP')
    img_byte_arr.seek(0)
    img = load_img(img_byte_arr, target_size=(64, 64))
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array,axis=0)
    return img_array

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/home')
def about():
    return render_template("home.html")

@app.route('/predict',methods=['POST'])
def predict():
    if 'file' not in request.files:
        return {'error': 'No file selected'}, 400
    file = request.files['file']
    if file.filename == '':
        return {'error': 'No file selected'}, 400
    image = preprocess_image(file)
    predictions = model.predict(image)
    class_names=['A+','A-','AB+','AB-','B+','B-','O+','O-']
    predicted_class = int(np.argmax(predictions[0]))
    predicted_type = class_names[predicted_class]
    return {'prediction': predicted_type, 'confidence':float(np.max(predictions[0]))}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)