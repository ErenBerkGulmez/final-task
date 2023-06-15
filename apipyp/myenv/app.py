from flask import Flask, request, jsonify
from textblob import TextBlob
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    data = request.get_json()
    text = data.get('text')

    if text:
        blob = TextBlob(text)
        sentiment = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        # Define your own sentiment labels based on polarity value
        if sentiment > 0:
            sentiment_label = 'Positive'
        elif sentiment < 0:
            sentiment_label = 'Negative'
        else:
            sentiment_label = 'Neutral'

        response = {
            'sentiment': sentiment_label,
            'polarity': sentiment,
            'subjectivity': subjectivity
        }
        return jsonify(response)
    else:
        return jsonify({'error': 'Text not provided'})

if __name__ == '__main__':
    app.run()
