{% extends '../layouts/metronic.html' %}

{% block title %}管理控制台 - 图表{% endblock %}

{% block homeLink %}/admin{% endblock %}

{% block logoURL %}../metronic/media/image/logo.png{% endblock %}

{% block theme %}default{% endblock %}

{% block pageTitle %}图表{% endblock %}

{% block pageContent %}
<div class="page-content" id="pjax-container">
        <div class="container-fluid">
                <div class="row-fluid">
                        <div class="span12">
                                <h3 class="page-title">
                                        管理控制台 <small></small>
                                </h3>

                                <ul class="breadcrumb">
                                        <li>
                                                <i class="icon-home"></i>

                                                <a href="/admin/dashboard">首页</a>

                                                <i class="icon-angle-right"></i>

                                        </li>
                                        <li><a href="#">图表</a></li>
                                </ul>
                        </div>

                </div>
                <!-- 页面实际内容 -->
                <div id="real-content">
                        图表页内容
                </div>
        </div>
</div>
{% endblock %}