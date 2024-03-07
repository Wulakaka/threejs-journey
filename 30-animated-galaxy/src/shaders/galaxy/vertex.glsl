attribute float aScale;
uniform float uSize;

varying vec3 vColor;
void main() {
/**
    * The vertex shader's main function is called for each vertex in the geometry.
    * The job of the vertex shader is to transform the input vertex position to the
    * output position, and to calculate any other per-vertex attributes.
    *
    * The vertex shader is responsible for transforming the 3D vertex position in the
    * model coordinate space to the 2D position of the vertex on the screen. This is
    * done by multiplying the vertex position by the model, view, and projection matrices.
    *
    * The vertex shader is also responsible for calculating the size of the point, if
    * the geometry is a point. This is done by setting the gl_PointSize variable.
    */
    // 中文
    // 顶点着色器的主要功能是为几何体中的每个顶点调用。
    // 顶点着色器的工作是将输入顶点位置转换为输出位置，并计算任何其他每顶点属性。
    // 顶点着色器负责将模型坐标空间中的3D顶点位置转换为屏幕上顶点的2D位置。这是通过将顶点位置乘以模型、视图和投影矩阵来完成的。
    // 顶点着色器还负责计算点的大小，如果几何体是一个点。这是通过设置gl_PointSize变量来完成的。


    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Size
    gl_PointSize = uSize * aScale;
    //    Size attenuation
    //    Size of the point is calculated based on the distance from the camera.
    gl_PointSize *= (1.0 / -viewPosition.z);

    // Color
    // color 是 vertex shader 中已有的 attribute
    vColor = color;
}
