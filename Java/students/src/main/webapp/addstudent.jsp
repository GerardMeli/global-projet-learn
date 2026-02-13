<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
    <title>Liste des Étudiants</title>
</head>
<body>
    <h1>Liste des Étudiants</h1>
    
    <c:if test="${not empty message}">
        <div style="color: green;">${message}</div>
        <c:remove var="message" scope="session" />
    </c:if>
    
    <table border="1">
        <tr>
            <th>ID</th>
            <th>Prénom</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Filière</th>
        </tr>
        <c:forEach items="${students}" var="student">
            <tr>
                <td>${student.id}</td>
                <td>${student.firstName}</td>
                <td>${student.lastName}</td>
                <td>${student.email}</td>
                <td>${student.major}</td>
            </tr>
        </c:forEach>
    </table>
    
    <a href="add-student.jsp">Ajouter un étudiant</a>
</body>
</html>