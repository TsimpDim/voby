import boto3, json
from botocore.config import Config
import regex

class Aws:
    __bedrock: boto3 = None

    AWS_MODEL_ID = 'amazon.titan-text-express-v1'
    AWS_REGION = 'eu-west-1'
    AWS_RESPONSE_MAX_TOKEN = 200

    def _extract_json(text: str):
        pattern = r'\{(?:[^{}]|(?R))*\}'
        matches = regex.findall(pattern, text)
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
    
        return {}

    def get_or_create_bedrock_client():
        if not Aws.__bedrock:
            Aws.__bedrock = boto3.client('bedrock-runtime', config=Config(
                region_name = Aws.AWS_REGION
            ))
        
        return Aws.__bedrock

    def get_word_example_prompt(word: str, source_language: str, target_language: str):
        return f"""
            This is a request coming from a user learning {target_language}. Their original language is {source_language}.
            The want to know three real-word examples of the word '{word}' being used in {target_language}.
            Generate two examples of '{word}' being used and provide also an accurate translation of the examples in {source_language}.
            The examples should be friendly, useful for language learners (in everyday situations), and not very similar to one another. 

            Output rules (must all be followed):
                1. Output only a single JSON object.
                2. Do not include code fences, Markdown, explanations, or extra text.
                3. The JSON must start with '{{' and end with '}}'.
                4. Remove all formatting, whitespace, and newlines — the JSON must be a single line.
                5. The format must be exactly:
                    {{"examples":[{{"text":"<example1>","translation":"<translation1>"}},{{"text":"<example2>","translation":"<translation2>"}},{{"text":"<example3>","translation":"<translation3>"}}]}}
                6. The "text" attribute should contain the generate example in {source_language} and "translation" the same text but translated to {target_language}. Do not return the same sentence in both attributes.
                7. The text & translations should contain UTF-8 encoded text and no other special characters other than ! and ?.
        """

    def invoke(prompt: str):
        bedrock = Aws.get_or_create_bedrock_client()
        if not bedrock:
            print("Bedrock client not correctly initialized...")
            return

        body = json.dumps({
            "inputText": prompt,
            "textGenerationConfig": {
                "maxTokenCount": Aws.AWS_RESPONSE_MAX_TOKEN
            },
        })
        response = bedrock.invoke_model(
            body=body,
            contentType='application/json',
            accept='application/json',
            modelId=Aws.AWS_MODEL_ID,
            performanceConfigLatency='standard'
        )
        print(prompt)

        response = response['body'].read().decode('UTF-8')
        print(response)
        response_json = json.loads(response)

        data = {}
        if 'results' in response_json:
            data = Aws._extract_json(response_json['results'][0]['outputText'].strip())
            print(data)

        return data
