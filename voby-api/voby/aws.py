import boto3, json
from botocore.config import Config
import regex

class Aws:
    __bedrock: boto3 = None

    AWS_MODEL_ID = 'amazon.titan-text-express-v1'
    AWS_REGION = 'eu-west-1'
    AWS_RESPONSE_MAX_TOKEN_EXAMPLES = 200
    AWS_RESPONSE_MAX_TOKEN_WORDS = 500

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
            This is a request coming from a user learning {source_language}. Their original language is {target_language}.
            The want to know three real-word examples of the word '{word}' being used in {source_language}.
            Generate two examples of '{word}' being used and provide  an accurate translation of the examples in {target_language}.
            The examples should be friendly, useful for language learners (in everyday situations), not very similar to one another and of medium-hard complexity. 

            Output rules (must all be followed):
                Output only a single JSON object.
                Do not include code fences, Markdown, explanations, or extra text. Remove all formatting, whitespace, and newlines — the JSON must be a single line.
                The format must be exactly:
                    {{"examples":[{{"text":"<example1>","translation":"<translation1>"}},{{"text":"<example2>","translation":"<translation2>"}},{{"text":"<example3>","translation":"<translation3>"}}]}}
                The "text" attribute should contain the generate example in {source_language} and "translation" the same text but translated to {target_language}. Do not return the same sentence in both attributes.
        """

    def get_words_prompt(set: str, source_language: str, target_language: str):
        return f"""
            This is a request coming from a user learning {source_language}.
            Generate ten words that fit in the general topic or are related of "{set}" in {source_language} and translated to {target_language}. 
            The examples should be friendly, useful for language learners (for that topic), different from one another and of medium-hard complexity. Include the articles of the words. 

            Output rules (must all be followed):
                Output only a single JSON object.
                Do not include code fences, Markdown, explanations, or extra text. Remove all formatting, indentation, spacing and newlines — the JSON must be a single line.
                The schema of the JSON object must look like below:
                    {{"words":[{{"word":"<word1>","plural":"<pluralVersion>", "translation": "<translation>"}},{{"word":"<word2>","plural":"<pluralVersion>", "translation": "<translation>"}}]}}
                Do NOT return duplicates.

            Example: Words about the topic "Brot" from German to English
            Response: {{"words":[{{"word":"das Vollkornbrot","plural":"die Vollkornbrote","translation":"wholemeal bread"}},{{"word":"die Bäckerei","plural":"die Bäckereien","translation":"bakery"}},{{"word":"der Teig","plural":"die Teige","translation":"dough"}}...}}]}}
        """

    def invoke(prompt: str, max_token_count: int):
        bedrock = Aws.get_or_create_bedrock_client()
        if not bedrock:
            print("Bedrock client not correctly initialized...")
            return

        body = json.dumps({
            "inputText": prompt,
            "textGenerationConfig": {
                "maxTokenCount": max_token_count
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
