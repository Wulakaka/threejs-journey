vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 position, float specularPower) {
    normal = normalize(normal);

    vec3 lightDirection = normalize(lightPosition);
    vec3 lightReflection = reflect(-lightDirection, normal);
    // shading
    float shading = dot(normal, lightDirection);
    shading = max(shading, 0.0);

    // Specular
    vec3 viewDelta = position - cameraPosition;
    vec3 viewDirection = normalize(viewDelta);
    float specular = -dot(lightReflection, viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular, specularPower);

    return lightColor * lightIntensity * (shading + specular);
}
