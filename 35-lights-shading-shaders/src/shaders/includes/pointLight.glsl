vec3 pointLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 position, float specularPower, float lightDecay) {
    normal = normalize(normal);

    vec3 lightDelta = lightPosition - position;
    vec3 lightDirection = normalize(lightDelta);
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

    // decay
    float lightDistance = length(lightDelta);
    float decay = 1.0 - pow(lightDistance, 2.0) * lightDecay;
    decay = max(decay, 0.0);

    return lightColor * lightIntensity * (shading + specular) * decay;
}
