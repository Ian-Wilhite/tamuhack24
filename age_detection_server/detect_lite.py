from flask import Flask, jsonify, request
import cv2 as cv
import argparse

app = Flask(__name__)

def highlight_face(net, frame, conf_threshold=0.7):
    frame_opencv_dnn = frame.copy()
    frame_height, frame_width, _ = frame_opencv_dnn.shape
    blob = cv.dnn.blobFromImage(frame_opencv_dnn, 1.0, (300, 300), [104, 117, 123], True, False)

    net.setInput(blob)
    detections = net.forward()
    face_boxes = []

    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > conf_threshold:
            x1 = int(detections[0, 0, i, 3] * frame_width)
            y1 = int(detections[0, 0, i, 4] * frame_height)
            x2 = int(detections[0, 0, i, 5] * frame_width)
            y2 = int(detections[0, 0, i, 6] * frame_height)
            face_boxes.append([x1, y1, x2, y2])
            cv.rectangle(frame_opencv_dnn, (x1, y1), (x2, y2), (0, 255, 0), int(round(frame_height / 150)), 8)

    return frame_opencv_dnn, face_boxes

@app.route('/get_age_status', methods=['POST'])
def get_age_status():
    try:
        data = request.json
        image_path = data.get('image_path', '')
        video = cv.VideoCapture(image_path)

        has_frame, frame = video.read()
        if not has_frame:
            return jsonify({'age_status': False, 'error': 'Error reading image'})

        _, face_boxes = highlight_face(face_net, frame)

        if not face_boxes:
            return jsonify({'age_status': False, 'error': 'No face detected'})

        age_status = age_boxes_under_12(frame, face_boxes)
        return jsonify({'age_status': age_status, 'error': None})
    except Exception as e:
        return jsonify({'age_status': False, 'error': str(e)})
    finally:
        # Release resources
        video.release()

def age_boxes_under_12(frame, face_boxes):
    for face_box in face_boxes:
        face = frame[max(0, face_box[1] - padding):min(face_box[3] + padding, frame.shape[0] - 1),
               max(0, face_box[0] - padding):min(face_box[2] + padding, frame.shape[1] - 1)]

        blob = cv.dnn.blobFromImage(face, 1.0, (227, 227), MODEL_MEAN_VALUES, swapRB=False)
        age_net.setInput(blob)
        age_preds = age_net.forward()
        if age_preds[0].argmax() < 3:
            return True

    return False

if __name__ == '__main__':
    try:
        parser = argparse.ArgumentParser()
        parser.add_argument('--image')
        args = parser.parse_args()

        face_proto = "opencv_face_detector.pbtxt"
        face_model = "opencv_face_detector_uint8.pb"
        age_proto = "age_deploy.prototxt"
        age_model = "age_net.caffemodel"

        MODEL_MEAN_VALUES = (78.4263377603, 87.7689143744, 114.895847746)
        age_list = ['(0-2)', '(4-6)', '(8-12)', '(15-20)', '(25-32)', '(38-43)', '(48-53)', '(60-100)']

        face_net = cv.dnn.readNet(face_model, face_proto)
        age_net = cv.dnn.readNet(age_model, age_proto)

        padding = 20

        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        print(f"Error: {e}")
