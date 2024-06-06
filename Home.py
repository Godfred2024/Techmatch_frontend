import streamlit as st

st.image('/home/godfr/code/Godfred2024/TechMatch/images/logo-star.png',
         caption = 'TechMatch',
         width=70)


st.title(" TechMatch ")
st.markdown("""
## let us help you to find the tools you need!
""")

Problem  = st.text_input('How can we help you?:')
st.button('Find the best tools')


col1, col2 = st.columns(2)
# Add content to the left column
with col1:
    st.write("Tool 1")
    st.write("IMAGE OF TOOL 1")

    # Add content to the right column
with col2:
    st.write("Tool 2")
    st.write("IMAGE OF TOOL 2")
