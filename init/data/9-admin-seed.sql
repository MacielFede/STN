INSERT INTO public.administrator (id, password, username) VALUES (1, '$2a$10$InBD9inHGGNNkYQC1UJTuOEaucTuFeVMIP6Y.ncFjnYCNqZ06jid.', 'admin@gmail.com') ON CONFLICT DO NOTHING;

SELECT pg_catalog.setval('public.administrator_id_seq', 1, true);
