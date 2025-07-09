
INSERT INTO public.company (id, name) VALUES (1, 'RUTAS DEL SOL') ON CONFLICT DO NOTHING;
INSERT INTO public.company (id, name) VALUES (2, 'EGA') ON CONFLICT DO NOTHING;
INSERT INTO public.company (id, name) VALUES (3, 'NUÑEZ') ON CONFLICT DO NOTHING;
INSERT INTO public.company (id, name) VALUES (4, 'TURISMAR') ON CONFLICT DO NOTHING;
INSERT INTO public.company (id, name) VALUES (5, 'TURIL') ON CONFLICT DO NOTHING;


SELECT pg_catalog.setval('public.company_id_seq', 5, true);
