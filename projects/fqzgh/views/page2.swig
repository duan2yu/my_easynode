{% extends './layouts/layout-default.html' %}

{% block title %}Page2{% endblock %}

{% block content %}
<a href="/">HOME</a>&nbsp;<a href="/page3">Page 3</a>
{% endblock %}

{% block pageScript %}
        <script>
                alert('abc');
        </script>
{% endblock %}