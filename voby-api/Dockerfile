FROM python:3.9

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /voby-api

COPY . .

RUN pip install -r requirements.txt

EXPOSE 443

CMD /scripts/start.sh