"""Photoreal Kai Kora cover rendered with Blender Cycles.
Usage: python3 blender_scene.py out.png [yaw_deg] [samples] [res_percent]"""
import sys, json, math
import bpy
from mathutils import Vector

OUT = sys.argv[1]
YAW = float(sys.argv[2]) if len(sys.argv) > 2 else 34
SAMPLES = int(sys.argv[3]) if len(sys.argv) > 3 else 256
RES = int(sys.argv[4]) if len(sys.argv) > 4 else 100
here = __file__.rsplit('/', 1)[0]
data = json.load(open(f'{here}/logo_polys.json'))

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def srgb(r, g, b):
    f = lambda c: (c / 255) / 12.92 if c / 255 <= 0.04045 else ((c / 255 + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b), 1)

def principled(name, color, rough, spec=0.5, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = color
    b.inputs['Roughness'].default_value = rough
    b.inputs['Specular IOR Level'].default_value = spec
    if coat:
        b.inputs['Coat Weight'].default_value = coat
        b.inputs['Coat Roughness'].default_value = 0.35
    return m, b

# ---------- wall: limewash plaster ----------
bpy.ops.mesh.primitive_plane_add(size=6, location=(0, 0, 0.3), rotation=(math.radians(90), 0, 0))
wall = bpy.context.object
wm, wb = principled('Plaster', srgb(214, 208, 195), 0.92, 0.25)
nt = wm.node_tree
tc = nt.nodes.new('ShaderNodeTexCoord')
n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 3.0; n1.inputs['Detail'].default_value = 6
n1.inputs['Roughness'].default_value = 0.6
n2 = nt.nodes.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 140.0; n2.inputs['Detail'].default_value = 8
nt.links.new(tc.outputs['Object'], n1.inputs['Vector']); nt.links.new(tc.outputs['Object'], n2.inputs['Vector'])
# tonal mottling of the limewash
ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[0].color = srgb(200, 186, 164)
ramp.color_ramp.elements[1].position = 0.70; ramp.color_ramp.elements[1].color = srgb(214, 202, 182)
nt.links.new(n1.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], wb.inputs['Base Color'])
# fine plaster bump
mix = nt.nodes.new('ShaderNodeMath'); mix.operation = 'ADD'
nt.links.new(n1.outputs['Fac'], mix.inputs[0]); nt.links.new(n2.outputs['Fac'], mix.inputs[1])
bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.10; bump.inputs['Distance'].default_value = 0.002
nt.links.new(mix.outputs['Value'], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], wb.inputs['Normal'])
wall.data.materials.append(wm)

# ---------- letters: extruded, softly bevelled, powder-coated olive ----------
cu = bpy.data.curves.new('logo', 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
DEPTH, STANDOFF = 0.013, 0.006
cu.extrude = DEPTH / 2
cu.bevel_depth = 0.0012; cu.bevel_resolution = 3
cu.resolution_u = 1
for poly in data['polys']:
    sp = cu.splines.new('POLY'); sp.points.add(len(poly) - 1)
    for i, (x, y) in enumerate(poly):
        sp.points[i].co = (x, y, 0, 1)
    sp.use_cyclic_u = True
logo = bpy.data.objects.new('Logo', cu); scene.collection.objects.link(logo)
LOGO_Z = 0.42
logo.rotation_euler = (math.radians(90), 0, 0)
logo.location = (0, -(STANDOFF + DEPTH / 2 + 0.0012), LOGO_Z)
lm, lb = principled('Olive powder coat', srgb(70, 76, 56), 0.42, 0.45, coat=0.15)
nt = lm.node_tree
ln = nt.nodes.new('ShaderNodeTexNoise'); ln.inputs['Scale'].default_value = 900; ln.inputs['Detail'].default_value = 3
lbmp = nt.nodes.new('ShaderNodeBump'); lbmp.inputs['Strength'].default_value = 0.035
nt.links.new(ln.outputs['Fac'], lbmp.inputs['Height']); nt.links.new(lbmp.outputs['Normal'], lb.inputs['Normal'])
cu.materials.append(lm)

# ---------- painted tagline on the wall ----------
fnt = bpy.data.fonts.load('/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf')
tx = bpy.data.curves.new('tag', 'FONT'); tx.body = 'HOGAR  ·  MASCOTAS'; tx.font = fnt
tx.size = 0.030; tx.space_character = 1.55; tx.align_x = 'CENTER'; tx.extrude = 0.00015
tobj = bpy.data.objects.new('Tag', tx); scene.collection.objects.link(tobj)
tobj.rotation_euler = (math.radians(90), 0, 0)
tobj.location = (0, -0.0003, LOGO_Z - data['height'] / 2 - 0.085)
pm, pb = principled('Paint', srgb(78, 82, 64), 0.8, 0.3)
tx.materials.append(pm)

# ---------- light: low warm sun through a window, with leaves ----------
SUN_ROT = (math.radians(58), 0, math.radians(-52))
bpy.ops.object.light_add(type='SUN', rotation=SUN_ROT)
sun = bpy.context.object; sun.data.energy = 6.5; sun.data.angle = math.radians(1.2)
sun.data.color = (1.0, 0.82, 0.62)
sun_dir = (sun.matrix_world.to_quaternion() @ Vector((0, 0, -1))).normalized()   # direction light travels

def hidden(obj):
    obj.visible_camera = False; obj.visible_glossy = False; obj.visible_diffuse = False
    obj.visible_transmission = False; obj.visible_volume_scatter = False

# window wall with two openings, placed back along the sun ray
center = Vector((-0.15, 0, 0.55)) - sun_dir * 1.6
blk = bpy.data.materials.new('blocker')
def slab(name, loc, sx, sz):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object; o.scale = (sx, 0.02, sz); hidden(o); o.data.materials.append(blk); return o
q = sun_dir.to_track_quat('-Y', 'Z')
frame_parts = []
OW, OH, MUL = 0.55, 0.95, 0.06            # opening size and mullion width (meters)
for name, lx, lz, sx, sz in [('top', 0, OH / 2 + 1.5, 6, 3), ('bottom', 0, -OH / 2 - 1.5, 6, 3),
                             ('left', -OW - MUL / 2 - 1.5, 0, 3, OH + 0.01), ('right', OW + MUL / 2 + 1.5, 0, 3, OH + 0.01),
                             ('mullion', 0, 0, MUL, OH + 0.01), ('transom', 0, 0.12, 2 * OW + MUL, MUL)]:
    o = slab(name, (0, 0, 0), sx, sz)
    o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = q
    o.location = center + q @ Vector((lx, 0, lz))
    frame_parts.append(o)

# leaves: a few sprigs between the window and the wall
import random
random.seed(4)
leaf_mesh = bpy.data.meshes.new('leaf')
pts = [(0.5 * math.sin(math.pi * t / 20) * (1 if i == 0 else -1) * 0.38, t / 20, 0)
       for i in range(2) for t in (range(21) if i == 0 else range(19, 0, -1))]
leaf_mesh.from_pydata(pts, [], [list(range(len(pts)))])
for sprig in range(4):
    base = center + q @ Vector((-0.28 + sprig * 0.20, 0.35, 0.55 - sprig * 0.12))
    ang = math.radians(-120 + sprig * 25 + random.uniform(-10, 10))
    for j in range(7):
        step = 0.075
        base = base + q @ Vector((math.cos(ang) * step, 0, math.sin(ang) * step))
        ang += math.radians(random.uniform(-14, 14))
        for side in (-1, 1):
            lo = bpy.data.objects.new('leaf', leaf_mesh); scene.collection.objects.link(lo); hidden(lo)
            lo.rotation_mode = 'QUATERNION'
            from mathutils import Quaternion
            lo.rotation_quaternion = q @ Quaternion((1, 0, 0), math.radians(90)) @ \
                Quaternion((0, 0, 1), ang - math.pi / 2 + side * math.radians(55 + random.uniform(-10, 10)))
            s = random.uniform(0.07, 0.11); lo.scale = (s, s, s)
            lo.location = base

# soft sky fill
world = bpy.data.worlds.new('World'); scene.world = world; world.use_nodes = True
bg = world.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.78, 0.76, 0.74, 1); bg.inputs['Strength'].default_value = 0.40
bpy.ops.object.light_add(type='AREA', location=(1.6, -2.2, 0.9))
fill = bpy.context.object; fill.data.size = 2.5; fill.data.energy = 60; fill.data.color = (0.95, 0.97, 1.0)
fill.rotation_euler = (Vector((0, 0, LOGO_Z)) - fill.location).to_track_quat('-Z', 'Y').to_euler()

# ---------- camera: 50mm, seen from the side, shallow depth of field ----------
cam_d = 1.95
yaw = math.radians(YAW)
target = Vector((0, 0, LOGO_Z - 0.03))
cam_loc = target + Vector((math.sin(yaw) * cam_d, -math.cos(yaw) * cam_d, 0.10))
cd = bpy.data.cameras.new('cam'); cd.lens = 50; cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 36
cd.dof.use_dof = True; cd.dof.aperture_fstop = 3.2
cam = bpy.data.objects.new('Camera', cd); scene.collection.objects.link(cam)
cam.location = cam_loc
cam.rotation_euler = (target - cam_loc).to_track_quat('-Z', 'Y').to_euler()
cd.dof.focus_distance = (Vector((0, -0.03, LOGO_Z + 0.12)) - cam_loc).length
scene.camera = cam

# ---------- render ----------
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = 1080, 1920
scene.render.resolution_percentage = RES
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = 0.0
scene.render.film_transparent = False
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print('done', OUT)
