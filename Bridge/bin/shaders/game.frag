#ifdef GL_ES
	#ifndef GL_FRAGMENT_PRECISION_HIGH	// highp may not be defined
		#define highp mediump
	#endif
	precision highp float; // default precision needs to be defined
#endif

// input from vertex shader

in vec4 epos;
in vec3 norm;
in vec2 tc;

uniform uint color_mode;



// light 
uniform mat4	view_matrix;
uniform vec4	light_position, Ia, Id, Is;	// light

uniform vec4	Ka, Kd, Ks;					// material properties
uniform float	shininess;

// the only output variable
out vec4 fragColor;

vec4 phong( vec3 l, vec3 n, vec3 h, vec4 Kd )
{
	vec4 Ira = Ka*Ia;									// ambient reflection
	vec4 Ird = max(Kd*dot(l,n)*Id,0.0);					// diffuse reflection
	vec4 Irs = max(Ks*pow(dot(h,n),shininess)*Is,0.0);	// specular reflection
	return Ira + Ird + Irs;
}
vec4 attenuate(vec4 color,vec4 lpos)
{
	vec3 l = normalize(lpos.xyz - epos.xyz);
	float d = length(lpos.xyz - epos.xyz);
	d/=100;
	float a = 1.0 / (1.0 + 0.22*d + 0.019*d*d);
	return color*a;
}

void main()
{
	// light position in the eye space
	vec4 lpos = view_matrix*light_position;

	vec3 n = normalize(norm);	// norm interpolated via rasterizer should be normalized again here
	vec3 p = epos.xyz;			// 3D position of this fragment
	vec3 l = normalize(lpos.xyz-(lpos.a==0.0?vec3(0):p));	// lpos.a==0 means directional light
	vec3 v = normalize(-p);		// eye-epos = vec3(0)-epos
	vec3 h = normalize(l+v);	// the halfway vector

	//vec4 iKd = texture( TEX, tc );	// Kd from image
	/*
	if(mode==0)			fragColor = phong( l, n, h, iKd );
	else if(mode==1)	fragColor = phong( l, n, h, Kd );
	else if(mode==2)	fragColor = iKd;
	else				fragColor = vec4( tc, 0, 1 );
	*/


	if(color_mode == 0u) {
		fragColor = phong(l, n ,h,Kd);
		fragColor = attenuate(fragColor,light_position);
    } else if(color_mode == 1u) {
        fragColor = vec4(tc.xxx, 1);
    } else if(color_mode == 2u) {
        fragColor = vec4(tc.yyy, 1);
    }

}
