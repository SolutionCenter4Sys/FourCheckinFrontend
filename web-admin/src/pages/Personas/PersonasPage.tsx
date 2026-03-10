import { useState, useMemo } from 'react'
import {
  Box, Typography, Button, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, Alert, Snackbar,
  Avatar,
} from '@mui/material'
import {
  Search, Upload, Add, Edit, Block, CheckCircle,
  Person, Gavel, Business, WhatsApp, Email,
} from '@mui/icons-material'
import { COLORS } from '../../theme'
import type { Persona, TipoParticipante } from '../../models/types'

// ─── Mock — 60 personas (EP-08 / F-08.01) ───────────────────────────────────

const MOCK_PERSONAS: Persona[] = [
  // ── ADVOGADOS (20) ──
  { id: 'per-01', nome: 'Dr. Carlos Alberto Ferreira', cpf: '111.222.333-01', email: 'carlos.ferreira@advocacia.com.br', telefone: '(11) 99001-0001', whatsapp: '11990010001', estado: 'SP', cidade: 'São Paulo', tipo: 'ADVOGADO', oab: 'SP 123456', ativo: true, createdAt: '2025-01-10T10:00:00Z' },
  { id: 'per-02', nome: 'Dra. Beatriz Mendonça Costa', cpf: '111.222.333-02', email: 'beatriz.mendonca@jur.com.br', telefone: '(11) 99001-0002', whatsapp: '11990010002', estado: 'SP', cidade: 'São Paulo', tipo: 'ADVOGADO', oab: 'SP 234567', ativo: true, createdAt: '2025-01-11T10:00:00Z' },
  { id: 'per-03', nome: 'Dr. Roberto Alves Pinheiro', cpf: '111.222.333-03', email: 'roberto.pinheiro@escritorio.adv.br', telefone: '(11) 99001-0003', estado: 'SP', cidade: 'Guarulhos', tipo: 'ADVOGADO', oab: 'SP 345678', ativo: true, createdAt: '2025-01-12T10:00:00Z' },
  { id: 'per-04', nome: 'Dra. Fernanda Lopes Souza', cpf: '111.222.333-04', email: 'fernanda.lopes@lopes-souza.adv.br', telefone: '(11) 99001-0004', whatsapp: '11990010004', estado: 'SP', cidade: 'Santo André', tipo: 'ADVOGADO', oab: 'SP 456789', ativo: true, createdAt: '2025-01-13T10:00:00Z' },
  { id: 'per-05', nome: 'Dr. Marcelo Augusto Vieira', cpf: '111.222.333-05', email: 'marcelo.vieira@vieira.adv.br', telefone: '(11) 99001-0005', estado: 'SP', cidade: 'São Bernardo do Campo', tipo: 'ADVOGADO', oab: 'SP 567890', ativo: true, createdAt: '2025-01-14T10:00:00Z' },
  { id: 'per-06', nome: 'Dra. Juliana Ramos Oliveira', cpf: '111.222.333-06', email: 'juliana.ramos@ramos.adv.br', telefone: '(11) 99001-0006', whatsapp: '11990010006', estado: 'SP', cidade: 'Osasco', tipo: 'ADVOGADO', oab: 'SP 678901', ativo: true, createdAt: '2025-01-15T10:00:00Z' },
  { id: 'per-07', nome: 'Dr. Paulo Sérgio Andrade', cpf: '111.222.333-07', email: 'paulo.andrade@andrade.adv.br', telefone: '(11) 99001-0007', estado: 'SP', cidade: 'Diadema', tipo: 'ADVOGADO', oab: 'SP 789012', ativo: true, createdAt: '2025-01-16T10:00:00Z' },
  { id: 'per-08', nome: 'Dra. Ana Paula Machado', cpf: '111.222.333-08', email: 'ana.machado@machado-jur.com.br', telefone: '(11) 99001-0008', whatsapp: '11990010008', estado: 'SP', cidade: 'Barueri', tipo: 'ADVOGADO', oab: 'SP 890123', ativo: true, createdAt: '2025-01-17T10:00:00Z' },
  { id: 'per-09', nome: 'Dr. Gustavo Henrique Torres', cpf: '111.222.333-09', email: 'gustavo.torres@torres.adv.br', telefone: '(11) 99001-0009', estado: 'SP', cidade: 'São Paulo', tipo: 'ADVOGADO', oab: 'SP 901234', ativo: true, createdAt: '2025-01-18T10:00:00Z' },
  { id: 'per-10', nome: 'Dra. Carla Regina Figueiredo', cpf: '111.222.333-10', email: 'carla.figueiredo@figueiredo.adv.br', telefone: '(11) 99001-0010', whatsapp: '11990010010', estado: 'SP', cidade: 'Mogi das Cruzes', tipo: 'ADVOGADO', oab: 'SP 012345', ativo: true, createdAt: '2025-01-19T10:00:00Z' },
  { id: 'per-11', nome: 'Dr. Eduardo Lima Santos', cpf: '111.222.333-11', email: 'eduardo.lima@lima-santos.adv.br', telefone: '(11) 99001-0011', estado: 'SP', cidade: 'São Paulo', tipo: 'ADVOGADO', oab: 'SP 111213', ativo: true, createdAt: '2025-01-20T10:00:00Z' },
  { id: 'per-12', nome: 'Dra. Renata Cristina Borges', cpf: '111.222.333-12', email: 'renata.borges@borges.adv.br', telefone: '(11) 99001-0012', whatsapp: '11990010012', estado: 'SP', cidade: 'Guarulhos', tipo: 'ADVOGADO', oab: 'SP 141516', ativo: true, createdAt: '2025-01-21T10:00:00Z' },
  { id: 'per-13', nome: 'Dr. Leandro Martins Freitas', cpf: '111.222.333-13', email: 'leandro.freitas@freitas.adv.br', telefone: '(11) 99001-0013', estado: 'SP', cidade: 'Santo André', tipo: 'ADVOGADO', oab: 'SP 171819', ativo: false, createdAt: '2025-01-22T10:00:00Z' },
  { id: 'per-14', nome: 'Dra. Simone Aparecida Castro', cpf: '111.222.333-14', email: 'simone.castro@castro.adv.br', telefone: '(11) 99001-0014', whatsapp: '11990010014', estado: 'SP', cidade: 'Osasco', tipo: 'ADVOGADO', oab: 'SP 202122', ativo: true, createdAt: '2025-01-23T10:00:00Z' },
  { id: 'per-15', nome: 'Dr. Fábio Meneses Corrêa', cpf: '111.222.333-15', email: 'fabio.correa@correa.adv.br', telefone: '(11) 99001-0015', estado: 'SP', cidade: 'Barueri', tipo: 'ADVOGADO', oab: 'SP 232425', ativo: true, createdAt: '2025-01-24T10:00:00Z' },
  { id: 'per-16', nome: 'Dra. Vanessa Guimarães Pereira', cpf: '111.222.333-16', email: 'vanessa.guimaraes@gp.adv.br', telefone: '(11) 99001-0016', whatsapp: '11990010016', estado: 'SP', cidade: 'São Paulo', tipo: 'ADVOGADO', oab: 'SP 262728', ativo: true, createdAt: '2025-02-01T10:00:00Z' },
  { id: 'per-17', nome: 'Dr. André Luís Nascimento', cpf: '111.222.333-17', email: 'andre.nascimento@nascimento.adv.br', telefone: '(11) 99001-0017', estado: 'SP', cidade: 'Diadema', tipo: 'ADVOGADO', oab: 'SP 293031', ativo: true, createdAt: '2025-02-02T10:00:00Z' },
  { id: 'per-18', nome: 'Dra. Luciana Ferraz Teixeira', cpf: '111.222.333-18', email: 'luciana.teixeira@ferraz.adv.br', telefone: '(11) 99001-0018', whatsapp: '11990010018', estado: 'SP', cidade: 'São Paulo', tipo: 'ADVOGADO', oab: 'SP 323334', ativo: true, createdAt: '2025-02-03T10:00:00Z' },
  { id: 'per-19', nome: 'Dr. Rodrigo Campello Matos', cpf: '111.222.333-19', email: 'rodrigo.matos@campello.adv.br', telefone: '(11) 99001-0019', estado: 'SP', cidade: 'Taboão da Serra', tipo: 'ADVOGADO', oab: 'SP 353637', ativo: true, createdAt: '2025-02-04T10:00:00Z' },
  { id: 'per-20', nome: 'Dra. Cristiane Barbosa Lima', cpf: '111.222.333-20', email: 'cristiane.lima@barbosa.adv.br', telefone: '(11) 99001-0020', whatsapp: '11990010020', estado: 'SP', cidade: 'Carapicuíba', tipo: 'ADVOGADO', oab: 'SP 383940', ativo: true, createdAt: '2025-02-05T10:00:00Z' },
  // ── PREPOSTOS (20) ──
  { id: 'per-21', nome: 'Jonas Rodrigues Barros', cpf: '222.333.444-01', email: 'jonas.barros@empresa1.com.br', telefone: '(11) 98001-0001', whatsapp: '11980010001', estado: 'SP', cidade: 'São Paulo', tipo: 'PREPOSTO', empresa: 'Banco Alfa S.A.', departamento: 'Jurídico', ativo: true, createdAt: '2025-01-10T10:00:00Z' },
  { id: 'per-22', nome: 'Melissa Araujo Duarte', cpf: '222.333.444-02', email: 'melissa.duarte@empresa2.com.br', telefone: '(11) 98001-0002', whatsapp: '11980010002', estado: 'SP', cidade: 'Guarulhos', tipo: 'PREPOSTO', empresa: 'Beta Seguradora S.A.', departamento: 'RH', ativo: true, createdAt: '2025-01-11T10:00:00Z' },
  { id: 'per-23', nome: 'Clayton Vasconcelos Rocha', cpf: '222.333.444-03', email: 'clayton.rocha@empresa3.com.br', telefone: '(11) 98001-0003', estado: 'SP', cidade: 'Santo André', tipo: 'PREPOSTO', empresa: 'Gama Tecnologia Ltda', departamento: 'DP', ativo: true, createdAt: '2025-01-12T10:00:00Z' },
  { id: 'per-24', nome: 'Patricia Henrique Cavalcante', cpf: '222.333.444-04', email: 'patricia.cavalcante@empresa4.com.br', telefone: '(11) 98001-0004', whatsapp: '11980010004', estado: 'SP', cidade: 'São Bernardo do Campo', tipo: 'PREPOSTO', empresa: 'Delta Financeira S.A.', departamento: 'Jurídico', ativo: true, createdAt: '2025-01-13T10:00:00Z' },
  { id: 'per-25', nome: 'Márcio Afonso Nunes', cpf: '222.333.444-05', email: 'marcio.nunes@empresa5.com.br', telefone: '(11) 98001-0005', estado: 'SP', cidade: 'Osasco', tipo: 'PREPOSTO', empresa: 'Épsilon Investimentos S.A.', departamento: 'RH', ativo: true, createdAt: '2025-01-14T10:00:00Z' },
  { id: 'per-26', nome: 'Sueli Cristina Monteiro', cpf: '222.333.444-06', email: 'sueli.monteiro@empresa6.com.br', telefone: '(11) 98001-0006', whatsapp: '11980010006', estado: 'SP', cidade: 'Diadema', tipo: 'PREPOSTO', empresa: 'Zeta Crédito Ltda', departamento: 'Administrativo', ativo: true, createdAt: '2025-01-15T10:00:00Z' },
  { id: 'per-27', nome: 'Wellington Cruz Fonseca', cpf: '222.333.444-07', email: 'wellington.fonseca@empresa7.com.br', telefone: '(11) 98001-0007', estado: 'SP', cidade: 'Barueri', tipo: 'PREPOSTO', empresa: 'Eta Logística S.A.', departamento: 'DP', ativo: true, createdAt: '2025-01-16T10:00:00Z' },
  { id: 'per-28', nome: 'Cíntia Azevedo Brito', cpf: '222.333.444-08', email: 'cintia.brito@empresa8.com.br', telefone: '(11) 98001-0008', whatsapp: '11980010008', estado: 'SP', cidade: 'São Paulo', tipo: 'PREPOSTO', empresa: 'Theta Varejo Ltda', departamento: 'RH', ativo: true, createdAt: '2025-01-17T10:00:00Z' },
  { id: 'per-29', nome: 'Leonardo Praxedes Carvalho', cpf: '222.333.444-09', email: 'leonardo.carvalho@empresa9.com.br', telefone: '(11) 98001-0009', estado: 'SP', cidade: 'Mogi das Cruzes', tipo: 'PREPOSTO', empresa: 'Iota Construções S.A.', departamento: 'Jurídico', ativo: true, createdAt: '2025-01-18T10:00:00Z' },
  { id: 'per-30', nome: 'Elaine Santos Barbosa', cpf: '222.333.444-10', email: 'elaine.barbosa@empresa10.com.br', telefone: '(11) 98001-0010', whatsapp: '11980010010', estado: 'SP', cidade: 'São Paulo', tipo: 'PREPOSTO', empresa: 'Kappa Alimentos Ltda', departamento: 'DP', ativo: true, createdAt: '2025-01-19T10:00:00Z' },
  { id: 'per-31', nome: 'Rafael Teixeira Godoy', cpf: '222.333.444-11', email: 'rafael.godoy@empresa11.com.br', telefone: '(11) 98001-0011', estado: 'SP', cidade: 'Guarulhos', tipo: 'PREPOSTO', empresa: 'Lambda Transportes S.A.', departamento: 'RH', ativo: true, createdAt: '2025-01-20T10:00:00Z' },
  { id: 'per-32', nome: 'Tânia Cristina Souza', cpf: '222.333.444-12', email: 'tania.souza@empresa12.com.br', telefone: '(11) 98001-0012', whatsapp: '11980010012', estado: 'SP', cidade: 'Santo André', tipo: 'PREPOSTO', empresa: 'Mu Energia Ltda', departamento: 'Jurídico', ativo: true, createdAt: '2025-01-21T10:00:00Z' },
  { id: 'per-33', nome: 'Gilberto Moraes Pinto', cpf: '222.333.444-13', email: 'gilberto.pinto@empresa13.com.br', telefone: '(11) 98001-0013', estado: 'SP', cidade: 'Osasco', tipo: 'PREPOSTO', empresa: 'Nu Farmácias S.A.', departamento: 'Administrativo', ativo: false, createdAt: '2025-01-22T10:00:00Z' },
  { id: 'per-34', nome: 'Alessandra Campos Viana', cpf: '222.333.444-14', email: 'alessandra.viana@empresa14.com.br', telefone: '(11) 98001-0014', whatsapp: '11980010014', estado: 'SP', cidade: 'São Paulo', tipo: 'PREPOSTO', empresa: 'Xi Eletrônicos Ltda', departamento: 'RH', ativo: true, createdAt: '2025-01-23T10:00:00Z' },
  { id: 'per-35', nome: 'Sérgio Lourenço Melo', cpf: '222.333.444-15', email: 'sergio.melo@empresa15.com.br', telefone: '(11) 98001-0015', estado: 'SP', cidade: 'Barueri', tipo: 'PREPOSTO', empresa: 'Omicron Seguros S.A.', departamento: 'Jurídico', ativo: true, createdAt: '2025-01-24T10:00:00Z' },
  { id: 'per-36', nome: 'Denise Aparecida Ramos', cpf: '222.333.444-16', email: 'denise.ramos@empresa16.com.br', telefone: '(11) 98001-0016', whatsapp: '11980010016', estado: 'SP', cidade: 'Diadema', tipo: 'PREPOSTO', empresa: 'Pi Telecom Ltda', departamento: 'DP', ativo: true, createdAt: '2025-02-01T10:00:00Z' },
  { id: 'per-37', nome: 'Heitor Magalhães Correia', cpf: '222.333.444-17', email: 'heitor.correia@empresa17.com.br', telefone: '(11) 98001-0017', estado: 'SP', cidade: 'Carapicuíba', tipo: 'PREPOSTO', empresa: 'Rho Supermercados S.A.', departamento: 'RH', ativo: true, createdAt: '2025-02-02T10:00:00Z' },
  { id: 'per-38', nome: 'Rosana Freitas Almeida', cpf: '222.333.444-18', email: 'rosana.almeida@empresa18.com.br', telefone: '(11) 98001-0018', whatsapp: '11980010018', estado: 'SP', cidade: 'Taboão da Serra', tipo: 'PREPOSTO', empresa: 'Sigma Civil Ltda', departamento: 'Jurídico', ativo: true, createdAt: '2025-02-03T10:00:00Z' },
  { id: 'per-39', nome: 'Adriano Campos Braga', cpf: '222.333.444-19', email: 'adriano.braga@empresa19.com.br', telefone: '(11) 98001-0019', estado: 'SP', cidade: 'São Paulo', tipo: 'PREPOSTO', empresa: 'Tau Metalúrgica S.A.', departamento: 'DP', ativo: true, createdAt: '2025-02-04T10:00:00Z' },
  { id: 'per-40', nome: 'Sandra Lúcia Bastos', cpf: '222.333.444-20', email: 'sandra.bastos@empresa20.com.br', telefone: '(11) 98001-0020', whatsapp: '11980010020', estado: 'SP', cidade: 'São Bernardo do Campo', tipo: 'PREPOSTO', empresa: 'Upsilon Serviços Ltda', departamento: 'Administrativo', ativo: true, createdAt: '2025-02-05T10:00:00Z' },
  // ── TESTEMUNHAS (20) ──
  { id: 'per-41', nome: 'João Paulo Ribeiro Souza', cpf: '333.444.555-01', email: 'joao.ribeiro@gmail.com', telefone: '(11) 97001-0001', whatsapp: '11970010001', estado: 'SP', cidade: 'São Paulo', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-10T10:00:00Z' },
  { id: 'per-42', nome: 'Maria José Pereira Lima', cpf: '333.444.555-02', email: 'mariajose.lima@gmail.com', telefone: '(11) 97001-0002', estado: 'SP', cidade: 'Guarulhos', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-11T10:00:00Z' },
  { id: 'per-43', nome: 'Antonio Carlos Batista', cpf: '333.444.555-03', email: 'antonio.batista@gmail.com', telefone: '(11) 97001-0003', whatsapp: '11970010003', estado: 'SP', cidade: 'Santo André', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-12T10:00:00Z' },
  { id: 'per-44', nome: 'Luzia Helena Gomes', cpf: '333.444.555-04', email: 'luzia.gomes@hotmail.com', telefone: '(11) 97001-0004', estado: 'SP', cidade: 'São Bernardo do Campo', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-13T10:00:00Z' },
  { id: 'per-45', nome: 'Valter Augusto Cardoso', cpf: '333.444.555-05', email: 'valter.cardoso@yahoo.com.br', telefone: '(11) 97001-0005', whatsapp: '11970010005', estado: 'SP', cidade: 'Osasco', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-14T10:00:00Z' },
  { id: 'per-46', nome: 'Rosa Maria Ferreira', cpf: '333.444.555-06', email: 'rosamaria.ferreira@gmail.com', telefone: '(11) 97001-0006', estado: 'SP', cidade: 'Diadema', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-15T10:00:00Z' },
  { id: 'per-47', nome: 'Benedito Salve Carvalho', cpf: '333.444.555-07', email: 'benedito.carvalho@gmail.com', telefone: '(11) 97001-0007', whatsapp: '11970010007', estado: 'SP', cidade: 'Barueri', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-16T10:00:00Z' },
  { id: 'per-48', nome: 'Teresinha Oliveira Coelho', cpf: '333.444.555-08', email: 'teresinha.coelho@gmail.com', telefone: '(11) 97001-0008', estado: 'SP', cidade: 'São Paulo', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-17T10:00:00Z' },
  { id: 'per-49', nome: 'Maurício Neto Pires', cpf: '333.444.555-09', email: 'mauricio.pires@hotmail.com', telefone: '(11) 97001-0009', whatsapp: '11970010009', estado: 'SP', cidade: 'Mogi das Cruzes', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-18T10:00:00Z' },
  { id: 'per-50', nome: 'Deise Cardoso Menezes', cpf: '333.444.555-10', email: 'deise.menezes@gmail.com', telefone: '(11) 97001-0010', estado: 'SP', cidade: 'São Paulo', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-19T10:00:00Z' },
  { id: 'per-51', nome: 'Odair Gonçalves Siqueira', cpf: '333.444.555-11', email: 'odair.siqueira@gmail.com', telefone: '(11) 97001-0011', whatsapp: '11970010011', estado: 'SP', cidade: 'Guarulhos', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-20T10:00:00Z' },
  { id: 'per-52', nome: 'Neuza Aparecida Rodrigues', cpf: '333.444.555-12', email: 'neuza.rodrigues@hotmail.com', telefone: '(11) 97001-0012', estado: 'SP', cidade: 'Santo André', tipo: 'TESTEMUNHA', ativo: false, createdAt: '2025-01-21T10:00:00Z' },
  { id: 'per-53', nome: 'Ivaldo Custódio Neves', cpf: '333.444.555-13', email: 'ivaldo.neves@gmail.com', telefone: '(11) 97001-0013', whatsapp: '11970010013', estado: 'SP', cidade: 'Osasco', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-22T10:00:00Z' },
  { id: 'per-54', nome: 'Cleuza Regina Lemos', cpf: '333.444.555-14', email: 'cleuza.lemos@yahoo.com.br', telefone: '(11) 97001-0014', estado: 'SP', cidade: 'Diadema', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-23T10:00:00Z' },
  { id: 'per-55', nome: 'Elias Medeiros Santana', cpf: '333.444.555-15', email: 'elias.santana@gmail.com', telefone: '(11) 97001-0015', whatsapp: '11970010015', estado: 'SP', cidade: 'Barueri', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-01-24T10:00:00Z' },
  { id: 'per-56', nome: 'Norma Salgado Branco', cpf: '333.444.555-16', email: 'norma.branco@hotmail.com', telefone: '(11) 97001-0016', estado: 'SP', cidade: 'Carapicuíba', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-02-01T10:00:00Z' },
  { id: 'per-57', nome: 'Raimundo Nonato Alves', cpf: '333.444.555-17', email: 'raimundo.alves@gmail.com', telefone: '(11) 97001-0017', whatsapp: '11970010017', estado: 'SP', cidade: 'Taboão da Serra', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-02-02T10:00:00Z' },
  { id: 'per-58', nome: 'Geralda Pereira Carmo', cpf: '333.444.555-18', email: 'geralda.carmo@gmail.com', telefone: '(11) 97001-0018', estado: 'SP', cidade: 'São Paulo', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-02-03T10:00:00Z' },
  { id: 'per-59', nome: 'Orlando Magno Faria', cpf: '333.444.555-19', email: 'orlando.faria@yahoo.com.br', telefone: '(11) 97001-0019', whatsapp: '11970010019', estado: 'SP', cidade: 'São Bernardo do Campo', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-02-04T10:00:00Z' },
  { id: 'per-60', nome: 'Sebastiana Lúcia Cunha', cpf: '333.444.555-20', email: 'sebastiana.cunha@gmail.com', telefone: '(11) 97001-0020', estado: 'SP', cidade: 'São Paulo', tipo: 'TESTEMUNHA', ativo: true, createdAt: '2025-02-05T10:00:00Z' },
]

// ─── Configuração visual por tipo ──────────────────────────────────────────
const TIPO_CONFIG: Record<TipoParticipante, { label: string; color: string; icon: React.ReactNode }> = {
  ADVOGADO:  { label: 'Advogado',  color: '#3B82F6', icon: <Gavel sx={{ fontSize: 14 }} /> },
  PREPOSTO:  { label: 'Preposto',  color: '#FF6600', icon: <Business sx={{ fontSize: 14 }} /> },
  TESTEMUNHA:{ label: 'Testemunha',color: '#4ADE80', icon: <Person sx={{ fontSize: 14 }} /> },
}

const ESTADOS_BR = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
const CIDADES_SP = ['Barueri','Carapicuíba','Diadema','Guarulhos','Mogi das Cruzes','Osasco','Santo André','São Bernardo do Campo','São Paulo','Taboão da Serra']

// ─── Componente principal ──────────────────────────────────────────────────
export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>(MOCK_PERSONAS)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoParticipante | ''>('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('')
  const [dialogAberto, setDialogAberto] = useState(false)
  const [snack, setSnack] = useState<{ open: boolean; msg: string; tipo: 'success' | 'error' }>({ open: false, msg: '', tipo: 'success' })
  const [form, setForm] = useState<Partial<Persona>>({ tipo: 'ADVOGADO', estado: 'SP', ativo: true })

  const filtradas = useMemo(() => personas.filter(p => {
    const q = busca.toLowerCase()
    const matchBusca = !q || p.nome.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    const matchTipo = !filtroTipo || p.tipo === filtroTipo
    const matchEstado = !filtroEstado || p.estado === filtroEstado
    const matchCidade = !filtroCidade || p.cidade === filtroCidade
    return matchBusca && matchTipo && matchEstado && matchCidade
  }), [personas, busca, filtroTipo, filtroEstado, filtroCidade])

  const totais = useMemo(() => ({
    total: personas.filter(p => p.ativo).length,
    advogados: personas.filter(p => p.tipo === 'ADVOGADO' && p.ativo).length,
    prepostos: personas.filter(p => p.tipo === 'PREPOSTO' && p.ativo).length,
    testemunhas: personas.filter(p => p.tipo === 'TESTEMUNHA' && p.ativo).length,
  }), [personas])

  const toggleAtivo = (id: string) => {
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, ativo: !p.ativo } : p))
    setSnack({ open: true, msg: 'Status atualizado.', tipo: 'success' })
  }

  const handleSalvar = () => {
    if (!form.nome?.trim() || !form.email?.trim() || !form.telefone?.trim()) {
      setSnack({ open: true, msg: 'Nome, e-mail e telefone são obrigatórios.', tipo: 'error' })
      return
    }
    const nova: Persona = {
      id: `per-${Date.now()}`,
      nome: form.nome!,
      cpf: form.cpf ?? '',
      email: form.email!,
      telefone: form.telefone!,
      whatsapp: form.whatsapp,
      estado: form.estado ?? 'SP',
      cidade: form.cidade ?? '',
      tipo: form.tipo ?? 'ADVOGADO',
      oab: form.oab,
      empresa: form.empresa,
      departamento: form.departamento,
      ativo: true,
      createdAt: new Date().toISOString(),
    }
    setPersonas(prev => [nova, ...prev])
    setDialogAberto(false)
    setForm({ tipo: 'ADVOGADO', estado: 'SP', ativo: true })
    setSnack({ open: true, msg: 'Persona cadastrada com sucesso!', tipo: 'success' })
  }

  const setF = (key: keyof Persona, value: unknown) => setForm(f => ({ ...f, [key]: value }))

  return (
    <Box>
      {/* ── Cabeçalho ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: COLORS.white, fontWeight: 800 }}>Personas</Typography>
          <Typography variant="body2" sx={{ color: COLORS.gray3, mt: 0.5 }}>
            Cadastro de Prepostos, Advogados e Testemunhas para audiências
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Upload />} sx={{ color: COLORS.gray3, borderColor: COLORS.border }}>
            Upload CSV
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogAberto(true)}>
            Nova Persona
          </Button>
        </Box>
      </Box>

      {/* ── Cards de totais ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Ativos', value: totais.total, color: COLORS.orange },
          { label: 'Advogados', value: totais.advogados, color: '#3B82F6' },
          { label: 'Prepostos', value: totais.prepostos, color: COLORS.orange },
          { label: 'Testemunhas', value: totais.testemunhas, color: '#4ADE80' },
        ].map(c => (
          <Paper key={c.label} sx={{ px: 3, py: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, flex: '1 1 140px' }}>
            <Typography variant="h5" sx={{ color: c.color, fontWeight: 800 }}>{c.value}</Typography>
            <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{c.label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* ── Filtros ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          size="small"
          sx={{ flex: '1 1 260px' }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: COLORS.gray3, fontSize: 18 }} /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Tipo</InputLabel>
          <Select value={filtroTipo} label="Tipo" onChange={e => setFiltroTipo(e.target.value as TipoParticipante | '')}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ADVOGADO">Advogado</MenuItem>
            <MenuItem value="PREPOSTO">Preposto</MenuItem>
            <MenuItem value="TESTEMUNHA">Testemunha</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={filtroEstado} label="Estado" onChange={e => { setFiltroEstado(e.target.value); setFiltroCidade('') }}>
            <MenuItem value="">Todos</MenuItem>
            {ESTADOS_BR.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Cidade</InputLabel>
          <Select value={filtroCidade} label="Cidade" onChange={e => setFiltroCidade(e.target.value)} disabled={filtroEstado !== 'SP'}>
            <MenuItem value="">Todas</MenuItem>
            {CIDADES_SP.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        {(busca || filtroTipo || filtroEstado || filtroCidade) && (
          <Button size="small" sx={{ color: COLORS.gray3 }} onClick={() => { setBusca(''); setFiltroTipo(''); setFiltroEstado(''); setFiltroCidade('') }}>
            Limpar filtros
          </Button>
        )}
      </Box>

      {/* ── Tabela ── */}
      <TableContainer component={Paper} sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Persona', 'Tipo', 'Contato', 'Localização', 'Detalhe', 'Status', 'Ações'].map(h => (
                <TableCell key={h} sx={{ color: COLORS.gray3, fontWeight: 600, fontSize: 12 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtradas.map(p => {
              const cfg = TIPO_CONFIG[p.tipo]
              const iniciais = p.nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
              return (
                <TableRow key={p.id} hover sx={{ opacity: p.ativo ? 1 : 0.5, '&:hover': { bgcolor: COLORS.raised } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: `${cfg.color}22`, color: cfg.color, fontSize: 12, fontWeight: 700 }}>
                        {iniciais}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ color: COLORS.white, fontWeight: 500 }}>{p.nome}</Typography>
                        <Typography variant="caption" sx={{ color: COLORS.gray4 }}>{p.cpf}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={cfg.icon as React.ReactElement}
                      label={cfg.label}
                      size="small"
                      sx={{ bgcolor: `${cfg.color}18`, color: cfg.color, fontWeight: 600, fontSize: 11, border: `1px solid ${cfg.color}40` }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email sx={{ fontSize: 11, color: COLORS.gray4 }} />
                        <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{p.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WhatsApp sx={{ fontSize: 11, color: p.whatsapp ? '#4ADE80' : COLORS.gray4 }} />
                        <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{p.telefone}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: COLORS.gray3 }}>{p.cidade} — {p.estado}</Typography>
                  </TableCell>
                  <TableCell>
                    {p.tipo === 'ADVOGADO' && p.oab && (
                      <Typography variant="caption" sx={{ color: COLORS.gray3 }}>OAB: {p.oab}</Typography>
                    )}
                    {p.tipo === 'PREPOSTO' && p.empresa && (
                      <Box>
                        <Typography variant="caption" sx={{ color: COLORS.gray3, display: 'block' }}>{p.empresa}</Typography>
                        {p.departamento && <Typography variant="caption" sx={{ color: COLORS.gray4, fontSize: '0.65rem' }}>{p.departamento}</Typography>}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      sx={{
                        bgcolor: p.ativo ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                        color: p.ativo ? '#4ADE80' : '#F87171',
                        fontWeight: 600, fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton size="small" sx={{ color: COLORS.gray3 }}><Edit fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title={p.ativo ? 'Inativar' : 'Ativar'}>
                      <IconButton size="small" sx={{ color: p.ativo ? '#F87171' : '#4ADE80' }} onClick={() => toggleAtivo(p.id)}>
                        {p.ativo ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: COLORS.gray3 }}>
                  Nenhuma persona encontrada para os filtros selecionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" sx={{ color: COLORS.gray4, mt: 1, display: 'block' }}>
        Exibindo {filtradas.length} de {personas.length} personas
      </Typography>

      {/* ── Dialog Nova Persona ── */}
      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` } }}>
        <DialogTitle sx={{ color: COLORS.white, borderBottom: `1px solid ${COLORS.border}` }}>
          Nova Persona
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo *</InputLabel>
                <Select value={form.tipo ?? 'ADVOGADO'} label="Tipo *" onChange={e => setF('tipo', e.target.value)}>
                  <MenuItem value="ADVOGADO">Advogado</MenuItem>
                  <MenuItem value="PREPOSTO">Preposto</MenuItem>
                  <MenuItem value="TESTEMUNHA">Testemunha</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Nome completo *" value={form.nome ?? ''} onChange={e => setF('nome', e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="CPF" value={form.cpf ?? ''} onChange={e => setF('cpf', e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="E-mail *" type="email" value={form.email ?? ''} onChange={e => setF('email', e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Telefone *" value={form.telefone ?? ''} onChange={e => setF('telefone', e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="WhatsApp" value={form.whatsapp ?? ''} onChange={e => setF('whatsapp', e.target.value)} />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado *</InputLabel>
                <Select value={form.estado ?? 'SP'} label="Estado *" onChange={e => setF('estado', e.target.value)}>
                  {ESTADOS_BR.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <TextField fullWidth size="small" label="Cidade *" value={form.cidade ?? ''} onChange={e => setF('cidade', e.target.value)} />
            </Grid>
            {form.tipo === 'ADVOGADO' && (
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Número OAB" value={form.oab ?? ''} onChange={e => setF('oab', e.target.value)} />
              </Grid>
            )}
            {form.tipo === 'PREPOSTO' && (
              <>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Empresa" value={form.empresa ?? ''} onChange={e => setF('empresa', e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Departamento" value={form.departamento ?? ''} onChange={e => setF('departamento', e.target.value)} />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${COLORS.border}`, px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialogAberto(false)} sx={{ color: COLORS.gray3 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvar} startIcon={<Add />}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.tipo} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  )
}
