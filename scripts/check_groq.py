import os
import traceback

print('Checking Groq environment...')
key = os.environ.get('GROQ_API_KEY')
model = os.environ.get('GROQ_MODEL', 'openai/gpt-oss-20b')
print('GROQ_API_KEY set:', bool(key))
print('GROQ_MODEL:', model)

try:
    from groq import Groq
    print('Groq package import: OK')
    client = Groq(api_key=key)
    print('Groq client created')
    try:
        # Try a tiny completion if supported
        print('Attempting a tiny completion (may fail if key invalid)')
        completion = client.chat.completions.create(
            messages=[{'role': 'system', 'content': 'You are a test.'}, {'role': 'user', 'content': 'Say hello.'}],
            model=model,
        )
        try:
            text = completion.choices[0].message.content
        except Exception:
            try:
                text = completion.choices[0].message['content']
            except Exception:
                text = str(completion)
        print('Completion OK. Text:', text)
    except Exception as e:
        print('Completion failed:', e)
        print(traceback.format_exc())
except ImportError as e:
    print('Groq package import failed:', e)
    print('Install with: pip install groq')
except Exception as e:
    print('Unexpected error initializing Groq client:', e)
    print(traceback.format_exc())
