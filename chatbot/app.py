
from flask import Flask, render_template, request, jsonify,send_file

from chat import get_response
import pandas as pd




app = Flask(__name__)




import csv
from io import StringIO


chat_df = pd.DataFrame(columns=['Date', 'Time', 'Message', 'Response'])
# print(chat_df)
@app.get('/')
def home( ):
    print("Let's chat! (type 'quit' to exit)")
    return render_template('base.html')



@app.post('/predict')
def predict():
    # Get the message from the request
    message = request.get_json()["message"]

    # Get the response from the chatbot
    response = get_response(message)
    text = request.get_json()["message"]
    response = get_response(text)
    message = {"answer": response}
    current_date = pd.Timestamp.now().strftime('%Y-%m-%d')
    current_time = pd.Timestamp.now().strftime('%H:%M:%S')
    global chat_df
    chat_df = pd.concat([chat_df, pd.DataFrame({'Date':[current_date], 'Time': [current_time], 'Message': [text], 'Response': [response]})], ignore_index=True)
    # chat_df = chat_df.({'Date': current_date, 'Time': current_time, 'Message': message, 'Response': response}, ignore_index=True)

    # Append the message and response to the chat DataFram
    # Save the updated chat DataFrame to an Excel file
    chat_df.to_excel('chat_transcripts.xlsx', index=False)

    # Return the chatbot's response as JSON
    return jsonify({"answer": response})




@app.route('/download', methods=['GET'])
def download_file():
    # Convert DataFrame to excel and save it into a file
    chat_df.to_excel('chat_transcripts.xlsx', index=False)
    # Send the excel file as an attachment for download
    return send_file('chat_transcripts.xlsx', as_attachment=True)




if __name__ == "__main__":
    app.run(debug=True)
