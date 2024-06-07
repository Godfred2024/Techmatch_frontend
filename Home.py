import streamlit as st
import requests

st.image('images/logo-star.png',
         caption = 'TechMatch',
         width=70)

st.title(" TechMatch ")
st.markdown("""
## let us help you to find the tools you need!
""")

Problem = st.text_input('How can we help you?:')
button_pressed = st.button('Find the best tools')


if Problem and button_pressed:
#API interface
    response = requests.get(
        'https://docker-techmatch-davskncavq-ew.a.run.app/tech_api',
        params={'text': Problem},
    ).json()

    response = response["tool"]

    st.write(response)
