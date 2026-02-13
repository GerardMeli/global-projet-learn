<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Students List</title>
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .success {
            color: green;
            margin: 10px 0;
            padding: 10px;
            background-color: #e8f5e9;
            border: 1px solid #c8e6c9;
        }
        .error {
            color: red;
            margin: 10px 0;
            padding: 10px;
            background-color: #ffebee;
            border: 1px solid #ffcdd2;
        }
    </style>
</head>
<body>
    <h2>Students List</h2>

    <%-- Success message --%>
    <c:if test="${not empty sessionScope.message}">
        <div class="success">${sessionScope.message}</div>
        <c:remove var="message" scope="session"/>
    </c:if>

    <%-- Error message --%>
    <c:if test="${not empty sessionScope.error}">
        <div class="error">${sessionScope.error}</div>
        <c:remove var="error" scope="session"/>
    </c:if>

    <%-- Student list table --%>
    <c:choose>
        <c:when test="${not empty requestScope.studentList and not empty requestScope.studentList[0]}">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Major</th>
                    </tr>
                </thead>
                <tbody>
                    <c:forEach var="student" items="${requestScope.studentList}">
                        <tr>
                            <td>${student.id}</td>
                            <td>${student.firstName}</td>
                            <td>${student.lastName}</td>
                            <td>${student.email}</td>
                            <td>${student.major}</td>
                        </tr>
                    </c:forEach>
                </tbody>
            </table>
        </c:when>
        <c:otherwise>
            <p>No students found in the database.</p>
        </c:otherwise>
    </c:choose>

    <p><a href="addStudent.jsp">Add New Student</a></p>
</body>
</html>